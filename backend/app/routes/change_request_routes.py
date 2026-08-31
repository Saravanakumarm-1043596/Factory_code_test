"""REST routes for ChangeRequest, mounted at /api/changerequests.

ChangeRequest has a file field, so create/update accept multipart/form-data
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
from modules.orchestrator.fullstack.schemas.change_request import ChangeRequestRead
from app.services import change_request_service as service

router = APIRouter(prefix="/api/changerequests", tags=["ChangeRequest"])


def _with_download_urls(obj):
    if obj is not None:
        obj.attachment_url = f"/api/changerequests/{obj.change_request_id}/download"
    return obj


@router.get("", response_model=list[ChangeRequestRead])
def list_changeRequest(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return [_with_download_urls(obj) for obj in service.list_all(db, skip=skip, limit=limit)]


@router.get("/{item_id}", response_model=ChangeRequestRead)
def get_changeRequest(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Change Request not found")
    return _with_download_urls(obj)


@router.post("", response_model=ChangeRequestRead, status_code=status.HTTP_201_CREATED)
def create_changeRequest(
    title: str = Form(...),
    description: str = Form(...),
    firewall_rule_set_id: int = Form(...),
    change_type: str = Form(...),
    status: str = Form(...),
    priority: str = Form(...),
    requestor: str = Form(...),
    justification: str = Form(...),
    created_at: datetime = Form(...),
    approver: Optional[str] = Form(None),
    risk_assessment: Optional[str] = Form(None),
    rule_issue_id: Optional[int] = Form(None),
    implementation_notes: Optional[str] = Form(None),
    submitted_at: Optional[datetime] = Form(None),
    approved_at: Optional[datetime] = Form(None),
    implemented_at: Optional[datetime] = Form(None),
    attachment: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    attachment_path, _attachment_size = storage.save_upload("change_request", "attachment", attachment)
    payload = {
        "title": title,
        "description": description,
        "firewall_rule_set_id": firewall_rule_set_id,
        "change_type": change_type,
        "status": status,
        "priority": priority,
        "requestor": requestor,
        "approver": approver,
        "justification": justification,
        "risk_assessment": risk_assessment,
        "rule_issue_id": rule_issue_id,
        "implementation_notes": implementation_notes,
        "submitted_at": submitted_at,
        "approved_at": approved_at,
        "implemented_at": implemented_at,
        "created_at": created_at,
        "attachment": attachment_path,
    }
    created = service.create(db, payload)
    return _with_download_urls(created)


@router.put("/{item_id}", response_model=ChangeRequestRead)
def update_changeRequest(
    item_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    firewall_rule_set_id: Optional[int] = Form(None),
    change_type: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    priority: Optional[str] = Form(None),
    requestor: Optional[str] = Form(None),
    approver: Optional[str] = Form(None),
    justification: Optional[str] = Form(None),
    risk_assessment: Optional[str] = Form(None),
    rule_issue_id: Optional[int] = Form(None),
    implementation_notes: Optional[str] = Form(None),
    submitted_at: Optional[datetime] = Form(None),
    approved_at: Optional[datetime] = Form(None),
    implemented_at: Optional[datetime] = Form(None),
    created_at: Optional[datetime] = Form(None),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Every Form field is optional here (metadata-only edits are allowed),
    # so unset fields arrive as None -- drop them rather than overwriting
    # existing column values with NULL (this mirrors the JSON route's
    # `exclude_unset=True` for a plain Pydantic Update schema).
    payload = {k: v for k, v in {
        "title": title,
        "description": description,
        "firewall_rule_set_id": firewall_rule_set_id,
        "change_type": change_type,
        "status": status,
        "priority": priority,
        "requestor": requestor,
        "approver": approver,
        "justification": justification,
        "risk_assessment": risk_assessment,
        "rule_issue_id": rule_issue_id,
        "implementation_notes": implementation_notes,
        "submitted_at": submitted_at,
        "approved_at": approved_at,
        "implemented_at": implemented_at,
        "created_at": created_at
    }.items() if v is not None}
    if attachment is not None:
        attachment_path, _attachment_size = storage.save_upload("change_request", "attachment", attachment)
        payload["attachment"] = attachment_path
    obj = service.update(db, item_id, payload)
    if obj is None:
        raise HTTPException(status_code=404, detail="Change Request not found")
    return _with_download_urls(obj)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_changeRequest(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Change Request not found")
    attachment_path = obj.attachment
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Change Request not found")
    if attachment_path:
        storage.delete_upload(attachment_path)
    return None


@router.get("/{item_id}/download")
def download_changeRequest(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Change Request not found")
    stored_path = obj.attachment
    if not stored_path:
        raise HTTPException(status_code=404, detail="No file uploaded for this Change Request")
    file_path = storage.STORAGE_DIR / stored_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    filename = Path(stored_path).name
    media_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    return FileResponse(file_path, filename=filename, media_type=media_type)
