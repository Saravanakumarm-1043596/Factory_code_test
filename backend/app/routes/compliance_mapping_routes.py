"""REST routes for ComplianceMapping, mounted at /api/compliancemappings.

ComplianceMapping has a file field, so create/update accept multipart/form-data
instead of a plain JSON body, and it gets a download route per file field.
See app/storage.py for the upload validation/storage helpers.
"""
from __future__ import annotations

import mimetypes
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app import storage
from app.database import get_db
from modules.orchestrator.fullstack.schemas.compliance_mapping import ComplianceMappingRead
from app.services import compliance_mapping_service as service

router = APIRouter(prefix="/api/compliancemappings", tags=["ComplianceMapping"])


def _with_download_urls(obj):
    if obj is not None:
        obj.evidence_file_url = f"/api/compliancemappings/{obj.compliance_mapping_id}/download"
    return obj


@router.get("", response_model=list[ComplianceMappingRead])
def list_complianceMapping(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return [_with_download_urls(obj) for obj in service.list_all(db, skip=skip, limit=limit)]


@router.get("/{item_id}", response_model=ComplianceMappingRead)
def get_complianceMapping(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Compliance Mapping not found")
    return _with_download_urls(obj)


@router.post("", response_model=ComplianceMappingRead, status_code=status.HTTP_201_CREATED)
def create_complianceMapping(
    framework: str = Form(...),
    control_id: str = Form(...),
    control_name: str = Form(...),
    compliance_status: str = Form(...),
    description: Optional[str] = Form(None),
    protected_system_id: Optional[int] = Form(None),
    firewall_rule_set_id: Optional[int] = Form(None),
    last_assessed_at: Optional[datetime] = Form(None),
    assessor: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    evidence_file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    evidence_file_path, _evidence_file_size = storage.save_upload("compliance_mapping", "evidence_file", evidence_file)
    payload = {
        "framework": framework,
        "control_id": control_id,
        "control_name": control_name,
        "description": description,
        "protected_system_id": protected_system_id,
        "firewall_rule_set_id": firewall_rule_set_id,
        "compliance_status": compliance_status,
        "last_assessed_at": last_assessed_at,
        "assessor": assessor,
        "notes": notes,
        "evidence_file": evidence_file_path,
    }
    created = service.create(db, payload)
    return _with_download_urls(created)


@router.put("/{item_id}", response_model=ComplianceMappingRead)
def update_complianceMapping(
    item_id: int,
    framework: Optional[str] = Form(None),
    control_id: Optional[str] = Form(None),
    control_name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    protected_system_id: Optional[int] = Form(None),
    firewall_rule_set_id: Optional[int] = Form(None),
    compliance_status: Optional[str] = Form(None),
    last_assessed_at: Optional[datetime] = Form(None),
    assessor: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    evidence_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Every Form field is optional here (metadata-only edits are allowed),
    # so unset fields arrive as None -- drop them rather than overwriting
    # existing column values with NULL (this mirrors the JSON route's
    # `exclude_unset=True` for a plain Pydantic Update schema).
    payload = {k: v for k, v in {
        "framework": framework,
        "control_id": control_id,
        "control_name": control_name,
        "description": description,
        "protected_system_id": protected_system_id,
        "firewall_rule_set_id": firewall_rule_set_id,
        "compliance_status": compliance_status,
        "last_assessed_at": last_assessed_at,
        "assessor": assessor,
        "notes": notes
    }.items() if v is not None}
    if evidence_file is not None:
        evidence_file_path, _evidence_file_size = storage.save_upload("compliance_mapping", "evidence_file", evidence_file)
        payload["evidence_file"] = evidence_file_path
    obj = service.update(db, item_id, payload)
    if obj is None:
        raise HTTPException(status_code=404, detail="Compliance Mapping not found")
    return _with_download_urls(obj)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_complianceMapping(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Compliance Mapping not found")
    evidence_file_path = obj.evidence_file
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Compliance Mapping not found")
    if evidence_file_path:
        storage.delete_upload(evidence_file_path)
    return None


@router.get("/{item_id}/download")
def download_complianceMapping(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Compliance Mapping not found")
    stored_path = obj.evidence_file
    if not stored_path:
        raise HTTPException(status_code=404, detail="No file uploaded for this Compliance Mapping")
    file_path = storage.STORAGE_DIR / stored_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    filename = Path(stored_path).name
    media_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    return FileResponse(file_path, filename=filename, media_type=media_type)
