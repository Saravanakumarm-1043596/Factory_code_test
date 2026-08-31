"""REST routes for EhrintegrationEvent, mounted at /api/ehrintegrationevents.

EhrintegrationEvent has a file field, so create/update accept multipart/form-data
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
from modules.orchestrator.fullstack.schemas.ehrintegration_event import EhrintegrationEventRead
from app.services import ehrintegration_event_service as service

router = APIRouter(prefix="/api/ehrintegrationevents", tags=["EhrintegrationEvent"])


def _with_download_urls(obj):
    if obj is not None:
        obj.payload_file_url = f"/api/ehrintegrationevents/{obj.ehr_integration_event_id}/download"
    return obj


@router.get("", response_model=list[EhrintegrationEventRead])
def list_ehrintegrationEvent(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return [_with_download_urls(obj) for obj in service.list_all(db, skip=skip, limit=limit)]


@router.get("/{item_id}", response_model=EhrintegrationEventRead)
def get_ehrintegrationEvent(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Ehrintegration Event not found")
    return _with_download_urls(obj)


@router.post("", response_model=EhrintegrationEventRead, status_code=status.HTTP_201_CREATED)
def create_ehrintegrationEvent(
    source_system: str = Form(...),
    direction: str = Form(...),
    event_type: str = Form(...),
    message_id: str = Form(...),
    status: str = Form(...),
    retry_count: int = Form(...),
    occurred_at: datetime = Form(...),
    created_at: datetime = Form(...),
    patient_id: Optional[str] = Form(None),
    appointment_id: Optional[str] = Form(None),
    error_message: Optional[str] = Form(None),
    processed_at: Optional[datetime] = Form(None),
    payload_file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    payload_file_path, _payload_file_size = storage.save_upload("ehrintegration_event", "payload_file", payload_file)
    payload = {
        "source_system": source_system,
        "direction": direction,
        "event_type": event_type,
        "message_id": message_id,
        "patient_id": patient_id,
        "appointment_id": appointment_id,
        "status": status,
        "error_message": error_message,
        "retry_count": retry_count,
        "occurred_at": occurred_at,
        "processed_at": processed_at,
        "created_at": created_at,
        "payload_file": payload_file_path,
    }
    created = service.create(db, payload)
    return _with_download_urls(created)


@router.put("/{item_id}", response_model=EhrintegrationEventRead)
def update_ehrintegrationEvent(
    item_id: str,
    source_system: Optional[str] = Form(None),
    direction: Optional[str] = Form(None),
    event_type: Optional[str] = Form(None),
    message_id: Optional[str] = Form(None),
    patient_id: Optional[str] = Form(None),
    appointment_id: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    error_message: Optional[str] = Form(None),
    retry_count: Optional[int] = Form(None),
    occurred_at: Optional[datetime] = Form(None),
    processed_at: Optional[datetime] = Form(None),
    created_at: Optional[datetime] = Form(None),
    payload_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Every Form field is optional here (metadata-only edits are allowed),
    # so unset fields arrive as None -- drop them rather than overwriting
    # existing column values with NULL (this mirrors the JSON route's
    # `exclude_unset=True` for a plain Pydantic Update schema).
    payload = {k: v for k, v in {
        "source_system": source_system,
        "direction": direction,
        "event_type": event_type,
        "message_id": message_id,
        "patient_id": patient_id,
        "appointment_id": appointment_id,
        "status": status,
        "error_message": error_message,
        "retry_count": retry_count,
        "occurred_at": occurred_at,
        "processed_at": processed_at,
        "created_at": created_at
    }.items() if v is not None}
    if payload_file is not None:
        payload_file_path, _payload_file_size = storage.save_upload("ehrintegration_event", "payload_file", payload_file)
        payload["payload_file"] = payload_file_path
    obj = service.update(db, item_id, payload)
    if obj is None:
        raise HTTPException(status_code=404, detail="Ehrintegration Event not found")
    return _with_download_urls(obj)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ehrintegrationEvent(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Ehrintegration Event not found")
    payload_file_path = obj.payload_file
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Ehrintegration Event not found")
    if payload_file_path:
        storage.delete_upload(payload_file_path)
    return None


@router.get("/{item_id}/download")
def download_ehrintegrationEvent(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Ehrintegration Event not found")
    stored_path = obj.payload_file
    if not stored_path:
        raise HTTPException(status_code=404, detail="No file uploaded for this Ehrintegration Event")
    file_path = storage.STORAGE_DIR / stored_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    filename = Path(stored_path).name
    media_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    return FileResponse(file_path, filename=filename, media_type=media_type)
