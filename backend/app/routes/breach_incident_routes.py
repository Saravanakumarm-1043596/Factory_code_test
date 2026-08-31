"""REST routes for BreachIncident, mounted at /api/breachincidents.

BreachIncident has a file field, so create/update accept multipart/form-data
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
from modules.orchestrator.fullstack.schemas.breach_incident import BreachIncidentRead
from app.services import breach_incident_service as service

router = APIRouter(prefix="/api/breachincidents", tags=["BreachIncident"])


def _with_download_urls(obj):
    if obj is not None:
        obj.supporting_document_url = f"/api/breachincidents/{obj.breach_incident_id}/download"
    return obj


@router.get("", response_model=list[BreachIncidentRead])
def list_breachIncident(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return [_with_download_urls(obj) for obj in service.list_all(db, skip=skip, limit=limit)]


@router.get("/{item_id}", response_model=BreachIncidentRead)
def get_breachIncident(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Breach Incident not found")
    return _with_download_urls(obj)


@router.post("", response_model=BreachIncidentRead, status_code=status.HTTP_201_CREATED)
def create_breachIncident(
    reported_by_user_id: str = Form(...),
    severity: str = Form(...),
    breach_type: str = Form(...),
    status: str = Form(...),
    affected_patient_count: int = Form(...),
    description: str = Form(...),
    discovered_at: datetime = Form(...),
    reported_at: datetime = Form(...),
    hhs_notification_deadline: date = Form(...),
    created_at: datetime = Form(...),
    updated_at: datetime = Form(...),
    hhs_notified_at: Optional[datetime] = Form(None),
    patient_notification_sent_at: Optional[datetime] = Form(None),
    root_cause: Optional[str] = Form(None),
    remediation_plan: Optional[str] = Form(None),
    resolved_at: Optional[datetime] = Form(None),
    supporting_document: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    supporting_document_path, _supporting_document_size = storage.save_upload("breach_incident", "supporting_document", supporting_document)
    payload = {
        "reported_by_user_id": reported_by_user_id,
        "severity": severity,
        "breach_type": breach_type,
        "status": status,
        "affected_patient_count": affected_patient_count,
        "description": description,
        "discovered_at": discovered_at,
        "reported_at": reported_at,
        "hhs_notification_deadline": hhs_notification_deadline,
        "hhs_notified_at": hhs_notified_at,
        "patient_notification_sent_at": patient_notification_sent_at,
        "root_cause": root_cause,
        "remediation_plan": remediation_plan,
        "resolved_at": resolved_at,
        "created_at": created_at,
        "updated_at": updated_at,
        "supporting_document": supporting_document_path,
    }
    created = service.create(db, payload)
    return _with_download_urls(created)


@router.put("/{item_id}", response_model=BreachIncidentRead)
def update_breachIncident(
    item_id: str,
    reported_by_user_id: Optional[str] = Form(None),
    severity: Optional[str] = Form(None),
    breach_type: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    affected_patient_count: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    discovered_at: Optional[datetime] = Form(None),
    reported_at: Optional[datetime] = Form(None),
    hhs_notification_deadline: Optional[date] = Form(None),
    hhs_notified_at: Optional[datetime] = Form(None),
    patient_notification_sent_at: Optional[datetime] = Form(None),
    root_cause: Optional[str] = Form(None),
    remediation_plan: Optional[str] = Form(None),
    resolved_at: Optional[datetime] = Form(None),
    created_at: Optional[datetime] = Form(None),
    updated_at: Optional[datetime] = Form(None),
    supporting_document: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Every Form field is optional here (metadata-only edits are allowed),
    # so unset fields arrive as None -- drop them rather than overwriting
    # existing column values with NULL (this mirrors the JSON route's
    # `exclude_unset=True` for a plain Pydantic Update schema).
    payload = {k: v for k, v in {
        "reported_by_user_id": reported_by_user_id,
        "severity": severity,
        "breach_type": breach_type,
        "status": status,
        "affected_patient_count": affected_patient_count,
        "description": description,
        "discovered_at": discovered_at,
        "reported_at": reported_at,
        "hhs_notification_deadline": hhs_notification_deadline,
        "hhs_notified_at": hhs_notified_at,
        "patient_notification_sent_at": patient_notification_sent_at,
        "root_cause": root_cause,
        "remediation_plan": remediation_plan,
        "resolved_at": resolved_at,
        "created_at": created_at,
        "updated_at": updated_at
    }.items() if v is not None}
    if supporting_document is not None:
        supporting_document_path, _supporting_document_size = storage.save_upload("breach_incident", "supporting_document", supporting_document)
        payload["supporting_document"] = supporting_document_path
    obj = service.update(db, item_id, payload)
    if obj is None:
        raise HTTPException(status_code=404, detail="Breach Incident not found")
    return _with_download_urls(obj)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_breachIncident(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Breach Incident not found")
    supporting_document_path = obj.supporting_document
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Breach Incident not found")
    if supporting_document_path:
        storage.delete_upload(supporting_document_path)
    return None


@router.get("/{item_id}/download")
def download_breachIncident(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Breach Incident not found")
    stored_path = obj.supporting_document
    if not stored_path:
        raise HTTPException(status_code=404, detail="No file uploaded for this Breach Incident")
    file_path = storage.STORAGE_DIR / stored_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    filename = Path(stored_path).name
    media_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    return FileResponse(file_path, filename=filename, media_type=media_type)
