"""REST routes for ComplianceFinding, mounted at /api/compliancefindings.

ComplianceFinding has a file field, so create/update accept multipart/form-data
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
from modules.orchestrator.fullstack.schemas.compliance_finding import ComplianceFindingRead
from app.services import compliance_finding_service as service

router = APIRouter(prefix="/api/compliancefindings", tags=["ComplianceFinding"])


def _with_download_urls(obj):
    if obj is not None:
        obj.evidence_attachment_url = f"/api/compliancefindings/{obj.compliance_finding_id}/download"
    return obj


@router.get("", response_model=list[ComplianceFindingRead])
def list_complianceFinding(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return [_with_download_urls(obj) for obj in service.list_all(db, skip=skip, limit=limit)]


@router.get("/{item_id}", response_model=ComplianceFindingRead)
def get_complianceFinding(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Compliance Finding not found")
    return _with_download_urls(obj)


@router.post("", response_model=ComplianceFindingRead, status_code=status.HTTP_201_CREATED)
def create_complianceFinding(
    compliance_control_id: int = Form(...),
    finding_type: str = Form(...),
    severity: str = Form(...),
    description: str = Form(...),
    affected_system: str = Form(...),
    status: str = Form(...),
    found_date: datetime = Form(...),
    created_at: datetime = Form(...),
    affected_line_of_business_id: Optional[int] = Form(None),
    assigned_to: Optional[str] = Form(None),
    remediation_plan: Optional[str] = Form(None),
    due_date: Optional[date] = Form(None),
    resolved_date: Optional[datetime] = Form(None),
    evidence_attachment: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    evidence_attachment_path, _evidence_attachment_size = storage.save_upload("compliance_finding", "evidence_attachment", evidence_attachment)
    payload = {
        "compliance_control_id": compliance_control_id,
        "finding_type": finding_type,
        "severity": severity,
        "description": description,
        "affected_system": affected_system,
        "affected_line_of_business_id": affected_line_of_business_id,
        "status": status,
        "assigned_to": assigned_to,
        "remediation_plan": remediation_plan,
        "due_date": due_date,
        "found_date": found_date,
        "resolved_date": resolved_date,
        "created_at": created_at,
        "evidence_attachment": evidence_attachment_path,
    }
    created = service.create(db, payload)
    return _with_download_urls(created)


@router.put("/{item_id}", response_model=ComplianceFindingRead)
def update_complianceFinding(
    item_id: int,
    compliance_control_id: Optional[int] = Form(None),
    finding_type: Optional[str] = Form(None),
    severity: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    affected_system: Optional[str] = Form(None),
    affected_line_of_business_id: Optional[int] = Form(None),
    status: Optional[str] = Form(None),
    assigned_to: Optional[str] = Form(None),
    remediation_plan: Optional[str] = Form(None),
    due_date: Optional[date] = Form(None),
    found_date: Optional[datetime] = Form(None),
    resolved_date: Optional[datetime] = Form(None),
    created_at: Optional[datetime] = Form(None),
    evidence_attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Every Form field is optional here (metadata-only edits are allowed),
    # so unset fields arrive as None -- drop them rather than overwriting
    # existing column values with NULL (this mirrors the JSON route's
    # `exclude_unset=True` for a plain Pydantic Update schema).
    payload = {k: v for k, v in {
        "compliance_control_id": compliance_control_id,
        "finding_type": finding_type,
        "severity": severity,
        "description": description,
        "affected_system": affected_system,
        "affected_line_of_business_id": affected_line_of_business_id,
        "status": status,
        "assigned_to": assigned_to,
        "remediation_plan": remediation_plan,
        "due_date": due_date,
        "found_date": found_date,
        "resolved_date": resolved_date,
        "created_at": created_at
    }.items() if v is not None}
    if evidence_attachment is not None:
        evidence_attachment_path, _evidence_attachment_size = storage.save_upload("compliance_finding", "evidence_attachment", evidence_attachment)
        payload["evidence_attachment"] = evidence_attachment_path
    obj = service.update(db, item_id, payload)
    if obj is None:
        raise HTTPException(status_code=404, detail="Compliance Finding not found")
    return _with_download_urls(obj)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_complianceFinding(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Compliance Finding not found")
    evidence_attachment_path = obj.evidence_attachment
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Compliance Finding not found")
    if evidence_attachment_path:
        storage.delete_upload(evidence_attachment_path)
    return None


@router.get("/{item_id}/download")
def download_complianceFinding(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Compliance Finding not found")
    stored_path = obj.evidence_attachment
    if not stored_path:
        raise HTTPException(status_code=404, detail="No file uploaded for this Compliance Finding")
    file_path = storage.STORAGE_DIR / stored_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    filename = Path(stored_path).name
    media_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    return FileResponse(file_path, filename=filename, media_type=media_type)
