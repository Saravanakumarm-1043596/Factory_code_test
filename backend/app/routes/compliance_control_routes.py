"""REST routes for ComplianceControl, mounted at /api/compliancecontrols.

ComplianceControl has a file field, so create/update accept multipart/form-data
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
from modules.orchestrator.fullstack.schemas.compliance_control import ComplianceControlRead
from app.services import compliance_control_service as service

router = APIRouter(prefix="/api/compliancecontrols", tags=["ComplianceControl"])


def _with_download_urls(obj):
    if obj is not None:
        obj.evidence_document_url = f"/api/compliancecontrols/{obj.compliance_control_id}/download"
    return obj


@router.get("", response_model=list[ComplianceControlRead])
def list_complianceControl(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return [_with_download_urls(obj) for obj in service.list_all(db, skip=skip, limit=limit)]


@router.get("/{item_id}", response_model=ComplianceControlRead)
def get_complianceControl(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Compliance Control not found")
    return _with_download_urls(obj)


@router.post("", response_model=ComplianceControlRead, status_code=status.HTTP_201_CREATED)
def create_complianceControl(
    control_framework: str = Form(...),
    control_identifier: str = Form(...),
    control_name: str = Form(...),
    description: str = Form(...),
    control_category: str = Form(...),
    status: str = Form(...),
    risk_level: str = Form(...),
    responsible_party: str = Form(...),
    created_at: datetime = Form(...),
    updated_at: datetime = Form(...),
    last_assessment_date: Optional[date] = Form(None),
    next_assessment_date: Optional[date] = Form(None),
    remediation_notes: Optional[str] = Form(None),
    evidence_document: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    evidence_document_path, _evidence_document_size = storage.save_upload("compliance_control", "evidence_document", evidence_document)
    payload = {
        "control_framework": control_framework,
        "control_identifier": control_identifier,
        "control_name": control_name,
        "description": description,
        "control_category": control_category,
        "status": status,
        "risk_level": risk_level,
        "last_assessment_date": last_assessment_date,
        "next_assessment_date": next_assessment_date,
        "responsible_party": responsible_party,
        "remediation_notes": remediation_notes,
        "created_at": created_at,
        "updated_at": updated_at,
        "evidence_document": evidence_document_path,
    }
    created = service.create(db, payload)
    return _with_download_urls(created)


@router.put("/{item_id}", response_model=ComplianceControlRead)
def update_complianceControl(
    item_id: int,
    control_framework: Optional[str] = Form(None),
    control_identifier: Optional[str] = Form(None),
    control_name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    control_category: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    risk_level: Optional[str] = Form(None),
    last_assessment_date: Optional[date] = Form(None),
    next_assessment_date: Optional[date] = Form(None),
    responsible_party: Optional[str] = Form(None),
    remediation_notes: Optional[str] = Form(None),
    created_at: Optional[datetime] = Form(None),
    updated_at: Optional[datetime] = Form(None),
    evidence_document: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Every Form field is optional here (metadata-only edits are allowed),
    # so unset fields arrive as None -- drop them rather than overwriting
    # existing column values with NULL (this mirrors the JSON route's
    # `exclude_unset=True` for a plain Pydantic Update schema).
    payload = {k: v for k, v in {
        "control_framework": control_framework,
        "control_identifier": control_identifier,
        "control_name": control_name,
        "description": description,
        "control_category": control_category,
        "status": status,
        "risk_level": risk_level,
        "last_assessment_date": last_assessment_date,
        "next_assessment_date": next_assessment_date,
        "responsible_party": responsible_party,
        "remediation_notes": remediation_notes,
        "created_at": created_at,
        "updated_at": updated_at
    }.items() if v is not None}
    if evidence_document is not None:
        evidence_document_path, _evidence_document_size = storage.save_upload("compliance_control", "evidence_document", evidence_document)
        payload["evidence_document"] = evidence_document_path
    obj = service.update(db, item_id, payload)
    if obj is None:
        raise HTTPException(status_code=404, detail="Compliance Control not found")
    return _with_download_urls(obj)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_complianceControl(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Compliance Control not found")
    evidence_document_path = obj.evidence_document
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Compliance Control not found")
    if evidence_document_path:
        storage.delete_upload(evidence_document_path)
    return None


@router.get("/{item_id}/download")
def download_complianceControl(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Compliance Control not found")
    stored_path = obj.evidence_document
    if not stored_path:
        raise HTTPException(status_code=404, detail="No file uploaded for this Compliance Control")
    file_path = storage.STORAGE_DIR / stored_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    filename = Path(stored_path).name
    media_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    return FileResponse(file_path, filename=filename, media_type=media_type)
