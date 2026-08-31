"""REST routes for AuditScan, mounted at /api/auditscans.

AuditScan has a file field, so create/update accept multipart/form-data
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
from modules.orchestrator.fullstack.schemas.audit_scan import AuditScanRead
from app.services import audit_scan_service as service

router = APIRouter(prefix="/api/auditscans", tags=["AuditScan"])


def _with_download_urls(obj):
    if obj is not None:
        obj.report_file_url = f"/api/auditscans/{obj.audit_scan_id}/download"
    return obj


@router.get("", response_model=list[AuditScanRead])
def list_auditScan(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return [_with_download_urls(obj) for obj in service.list_all(db, skip=skip, limit=limit)]


@router.get("/{item_id}", response_model=AuditScanRead)
def get_auditScan(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Audit Scan not found")
    return _with_download_urls(obj)


@router.post("", response_model=AuditScanRead, status_code=status.HTTP_201_CREATED)
def create_auditScan(
    scan_name: str = Form(...),
    scan_type: str = Form(...),
    status: str = Form(...),
    initiated_by: str = Form(...),
    started_at: datetime = Form(...),
    scope_description: Optional[str] = Form(None),
    total_rules_analyzed: Optional[int] = Form(None),
    issues_found: Optional[int] = Form(None),
    critical_issues_found: Optional[int] = Form(None),
    completed_at: Optional[datetime] = Form(None),
    report_file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    report_file_path, _report_file_size = storage.save_upload("audit_scan", "report_file", report_file)
    payload = {
        "scan_name": scan_name,
        "scan_type": scan_type,
        "status": status,
        "scope_description": scope_description,
        "total_rules_analyzed": total_rules_analyzed,
        "issues_found": issues_found,
        "critical_issues_found": critical_issues_found,
        "initiated_by": initiated_by,
        "started_at": started_at,
        "completed_at": completed_at,
        "report_file": report_file_path,
    }
    created = service.create(db, payload)
    return _with_download_urls(created)


@router.put("/{item_id}", response_model=AuditScanRead)
def update_auditScan(
    item_id: int,
    scan_name: Optional[str] = Form(None),
    scan_type: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    scope_description: Optional[str] = Form(None),
    total_rules_analyzed: Optional[int] = Form(None),
    issues_found: Optional[int] = Form(None),
    critical_issues_found: Optional[int] = Form(None),
    initiated_by: Optional[str] = Form(None),
    started_at: Optional[datetime] = Form(None),
    completed_at: Optional[datetime] = Form(None),
    report_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Every Form field is optional here (metadata-only edits are allowed),
    # so unset fields arrive as None -- drop them rather than overwriting
    # existing column values with NULL (this mirrors the JSON route's
    # `exclude_unset=True` for a plain Pydantic Update schema).
    payload = {k: v for k, v in {
        "scan_name": scan_name,
        "scan_type": scan_type,
        "status": status,
        "scope_description": scope_description,
        "total_rules_analyzed": total_rules_analyzed,
        "issues_found": issues_found,
        "critical_issues_found": critical_issues_found,
        "initiated_by": initiated_by,
        "started_at": started_at,
        "completed_at": completed_at
    }.items() if v is not None}
    if report_file is not None:
        report_file_path, _report_file_size = storage.save_upload("audit_scan", "report_file", report_file)
        payload["report_file"] = report_file_path
    obj = service.update(db, item_id, payload)
    if obj is None:
        raise HTTPException(status_code=404, detail="Audit Scan not found")
    return _with_download_urls(obj)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_auditScan(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Audit Scan not found")
    report_file_path = obj.report_file
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Audit Scan not found")
    if report_file_path:
        storage.delete_upload(report_file_path)
    return None


@router.get("/{item_id}/download")
def download_auditScan(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Audit Scan not found")
    stored_path = obj.report_file
    if not stored_path:
        raise HTTPException(status_code=404, detail="No file uploaded for this Audit Scan")
    file_path = storage.STORAGE_DIR / stored_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    filename = Path(stored_path).name
    media_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    return FileResponse(file_path, filename=filename, media_type=media_type)
