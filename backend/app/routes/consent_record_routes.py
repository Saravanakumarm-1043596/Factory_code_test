"""REST routes for ConsentRecord, mounted at /api/consentrecords.

ConsentRecord has a file field, so create/update accept multipart/form-data
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
from modules.orchestrator.fullstack.schemas.consent_record import ConsentRecordRead
from app.services import consent_record_service as service

router = APIRouter(prefix="/api/consentrecords", tags=["ConsentRecord"])


def _with_download_urls(obj):
    if obj is not None:
        obj.consent_document_url = f"/api/consentrecords/{obj.consent_record_id}/download"
    return obj


@router.get("", response_model=list[ConsentRecordRead])
def list_consentRecord(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return [_with_download_urls(obj) for obj in service.list_all(db, skip=skip, limit=limit)]


@router.get("/{item_id}", response_model=ConsentRecordRead)
def get_consentRecord(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Consent Record not found")
    return _with_download_urls(obj)


@router.post("", response_model=ConsentRecordRead, status_code=status.HTTP_201_CREATED)
def create_consentRecord(
    patient_id: str = Form(...),
    consent_type: str = Form(...),
    status: str = Form(...),
    granted_at: datetime = Form(...),
    collected_by_user_id: str = Form(...),
    created_at: datetime = Form(...),
    updated_at: datetime = Form(...),
    expires_at: Optional[date] = Form(None),
    revoked_at: Optional[datetime] = Form(None),
    notes: Optional[str] = Form(None),
    consent_document: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    consent_document_path, _consent_document_size = storage.save_upload("consent_record", "consent_document", consent_document)
    payload = {
        "patient_id": patient_id,
        "consent_type": consent_type,
        "status": status,
        "granted_at": granted_at,
        "expires_at": expires_at,
        "revoked_at": revoked_at,
        "collected_by_user_id": collected_by_user_id,
        "notes": notes,
        "created_at": created_at,
        "updated_at": updated_at,
        "consent_document": consent_document_path,
    }
    created = service.create(db, payload)
    return _with_download_urls(created)


@router.put("/{item_id}", response_model=ConsentRecordRead)
def update_consentRecord(
    item_id: str,
    patient_id: Optional[str] = Form(None),
    consent_type: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    granted_at: Optional[datetime] = Form(None),
    expires_at: Optional[date] = Form(None),
    revoked_at: Optional[datetime] = Form(None),
    collected_by_user_id: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
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
        "patient_id": patient_id,
        "consent_type": consent_type,
        "status": status,
        "granted_at": granted_at,
        "expires_at": expires_at,
        "revoked_at": revoked_at,
        "collected_by_user_id": collected_by_user_id,
        "notes": notes,
        "created_at": created_at,
        "updated_at": updated_at
    }.items() if v is not None}
    if consent_document is not None:
        consent_document_path, _consent_document_size = storage.save_upload("consent_record", "consent_document", consent_document)
        payload["consent_document"] = consent_document_path
    obj = service.update(db, item_id, payload)
    if obj is None:
        raise HTTPException(status_code=404, detail="Consent Record not found")
    return _with_download_urls(obj)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_consentRecord(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Consent Record not found")
    consent_document_path = obj.consent_document
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Consent Record not found")
    if consent_document_path:
        storage.delete_upload(consent_document_path)
    return None


@router.get("/{item_id}/download")
def download_consentRecord(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Consent Record not found")
    stored_path = obj.consent_document
    if not stored_path:
        raise HTTPException(status_code=404, detail="No file uploaded for this Consent Record")
    file_path = storage.STORAGE_DIR / stored_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    filename = Path(stored_path).name
    media_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    return FileResponse(file_path, filename=filename, media_type=media_type)
