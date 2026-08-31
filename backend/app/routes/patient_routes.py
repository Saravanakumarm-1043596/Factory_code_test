"""REST routes for Patient, mounted at /api/patients.

Patient has a file field, so create/update accept multipart/form-data
instead of a plain JSON body, and it gets a download route per file field.
See app/storage.py for the upload validation/storage helpers.
"""
from __future__ import annotations

import mimetypes
from datetime import date, datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app import storage
from app.database import get_db
from modules.orchestrator.fullstack.schemas.patient import PatientRead
from app.services import patient_service as service

router = APIRouter(prefix="/api/patients", tags=["Patient"])


def _with_download_urls(obj):
    if obj is not None:
        obj.consent_document_url = f"/api/patients/{obj.patient_id}/download"
    return obj


@router.get("", response_model=list[PatientRead])
def list_patient(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return [_with_download_urls(obj) for obj in service.list_all(db, skip=skip, limit=limit)]


@router.get("/{item_id}", response_model=PatientRead)
def get_patient(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return _with_download_urls(obj)


@router.post("", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
def create_patient(
    first_name: str = Form(...),
    last_name: str = Form(...),
    date_of_birth: date = Form(...),
    gender: str = Form(...),
    phone_number: str = Form(...),
    preferred_contact_method: str = Form(...),
    preferred_language: str = Form(...),
    membership_status: str = Form(...),
    ehr_source_system: str = Form(...),
    ehr_medical_record_number: str = Form(...),
    enrollment_date: date = Form(...),
    created_at: datetime = Form(...),
    updated_at: datetime = Form(...),
    email: Optional[str] = Form(None),
    no_show_risk_score: Optional[float] = Form(None),
    risk_score_updated_at: Optional[datetime] = Form(None),
    consent_document: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    consent_document_path, _consent_document_size = storage.save_upload("patient", "consent_document", consent_document)
    payload = {
        "first_name": first_name,
        "last_name": last_name,
        "date_of_birth": date_of_birth,
        "gender": gender,
        "email": email,
        "phone_number": phone_number,
        "preferred_contact_method": preferred_contact_method,
        "preferred_language": preferred_language,
        "membership_status": membership_status,
        "ehr_source_system": ehr_source_system,
        "ehr_medical_record_number": ehr_medical_record_number,
        "no_show_risk_score": no_show_risk_score,
        "risk_score_updated_at": risk_score_updated_at,
        "enrollment_date": enrollment_date,
        "created_at": created_at,
        "updated_at": updated_at,
        "consent_document": consent_document_path,
    }
    created = service.create(db, payload)
    return _with_download_urls(created)


@router.put("/{item_id}", response_model=PatientRead)
def update_patient(
    item_id: str,
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    date_of_birth: Optional[date] = Form(None),
    gender: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    preferred_contact_method: Optional[str] = Form(None),
    preferred_language: Optional[str] = Form(None),
    membership_status: Optional[str] = Form(None),
    ehr_source_system: Optional[str] = Form(None),
    ehr_medical_record_number: Optional[str] = Form(None),
    no_show_risk_score: Optional[float] = Form(None),
    risk_score_updated_at: Optional[datetime] = Form(None),
    enrollment_date: Optional[date] = Form(None),
    created_at: Optional[datetime] = Form(None),
    updated_at: Optional[datetime] = Form(None),
    consent_document: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Every Form field is optional here (metadata-only edits are allowed),
    # so unset fields arrive as None -- drop them rather than overwriting
    # existing column values with NULL (this mirrors the JSON route's
    # `exclude_unset=True` for a plain Pydantic Update schema).
    payload = {k: v for k, v in {
        "first_name": first_name,
        "last_name": last_name,
        "date_of_birth": date_of_birth,
        "gender": gender,
        "email": email,
        "phone_number": phone_number,
        "preferred_contact_method": preferred_contact_method,
        "preferred_language": preferred_language,
        "membership_status": membership_status,
        "ehr_source_system": ehr_source_system,
        "ehr_medical_record_number": ehr_medical_record_number,
        "no_show_risk_score": no_show_risk_score,
        "risk_score_updated_at": risk_score_updated_at,
        "enrollment_date": enrollment_date,
        "created_at": created_at,
        "updated_at": updated_at
    }.items() if v is not None}
    if consent_document is not None:
        consent_document_path, _consent_document_size = storage.save_upload("patient", "consent_document", consent_document)
        payload["consent_document"] = consent_document_path
    obj = service.update(db, item_id, payload)
    if obj is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return _with_download_urls(obj)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    consent_document_path = obj.consent_document
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Patient not found")
    if consent_document_path:
        storage.delete_upload(consent_document_path)
    return None


@router.get("/{item_id}/download")
def download_patient(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    stored_path = obj.consent_document
    if not stored_path:
        raise HTTPException(status_code=404, detail="No file uploaded for this Patient")
    file_path = storage.STORAGE_DIR / stored_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    filename = Path(stored_path).name
    media_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    return FileResponse(file_path, filename=filename, media_type=media_type)
