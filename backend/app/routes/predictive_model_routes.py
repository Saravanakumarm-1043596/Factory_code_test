"""REST routes for PredictiveModel, mounted at /api/predictivemodels.

PredictiveModel has a file field, so create/update accept multipart/form-data
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
from modules.orchestrator.fullstack.schemas.predictive_model import PredictiveModelRead
from app.services import predictive_model_service as service

router = APIRouter(prefix="/api/predictivemodels", tags=["PredictiveModel"])


def _with_download_urls(obj):
    if obj is not None:
        obj.model_artifact_url = f"/api/predictivemodels/{obj.predictive_model_id}/download"
    return obj


@router.get("", response_model=list[PredictiveModelRead])
def list_predictiveModel(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return [_with_download_urls(obj) for obj in service.list_all(db, skip=skip, limit=limit)]


@router.get("/{item_id}", response_model=PredictiveModelRead)
def get_predictiveModel(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Predictive Model not found")
    return _with_download_urls(obj)


@router.post("", response_model=PredictiveModelRead, status_code=status.HTTP_201_CREATED)
def create_predictiveModel(
    model_name: str = Form(...),
    model_version: str = Form(...),
    model_type: str = Form(...),
    status: str = Form(...),
    training_record_count: int = Form(...),
    trained_at: datetime = Form(...),
    created_at: datetime = Form(...),
    updated_at: datetime = Form(...),
    accuracy_score: Optional[float] = Form(None),
    auc_roc_score: Optional[float] = Form(None),
    deployed_at: Optional[datetime] = Form(None),
    model_artifact: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    model_artifact_path, _model_artifact_size = storage.save_upload("predictive_model", "model_artifact", model_artifact)
    payload = {
        "model_name": model_name,
        "model_version": model_version,
        "model_type": model_type,
        "status": status,
        "accuracy_score": accuracy_score,
        "auc_roc_score": auc_roc_score,
        "training_record_count": training_record_count,
        "trained_at": trained_at,
        "deployed_at": deployed_at,
        "created_at": created_at,
        "updated_at": updated_at,
        "model_artifact": model_artifact_path,
    }
    created = service.create(db, payload)
    return _with_download_urls(created)


@router.put("/{item_id}", response_model=PredictiveModelRead)
def update_predictiveModel(
    item_id: str,
    model_name: Optional[str] = Form(None),
    model_version: Optional[str] = Form(None),
    model_type: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    accuracy_score: Optional[float] = Form(None),
    auc_roc_score: Optional[float] = Form(None),
    training_record_count: Optional[int] = Form(None),
    trained_at: Optional[datetime] = Form(None),
    deployed_at: Optional[datetime] = Form(None),
    created_at: Optional[datetime] = Form(None),
    updated_at: Optional[datetime] = Form(None),
    model_artifact: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Every Form field is optional here (metadata-only edits are allowed),
    # so unset fields arrive as None -- drop them rather than overwriting
    # existing column values with NULL (this mirrors the JSON route's
    # `exclude_unset=True` for a plain Pydantic Update schema).
    payload = {k: v for k, v in {
        "model_name": model_name,
        "model_version": model_version,
        "model_type": model_type,
        "status": status,
        "accuracy_score": accuracy_score,
        "auc_roc_score": auc_roc_score,
        "training_record_count": training_record_count,
        "trained_at": trained_at,
        "deployed_at": deployed_at,
        "created_at": created_at,
        "updated_at": updated_at
    }.items() if v is not None}
    if model_artifact is not None:
        model_artifact_path, _model_artifact_size = storage.save_upload("predictive_model", "model_artifact", model_artifact)
        payload["model_artifact"] = model_artifact_path
    obj = service.update(db, item_id, payload)
    if obj is None:
        raise HTTPException(status_code=404, detail="Predictive Model not found")
    return _with_download_urls(obj)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_predictiveModel(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Predictive Model not found")
    model_artifact_path = obj.model_artifact
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Predictive Model not found")
    if model_artifact_path:
        storage.delete_upload(model_artifact_path)
    return None


@router.get("/{item_id}/download")
def download_predictiveModel(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Predictive Model not found")
    stored_path = obj.model_artifact
    if not stored_path:
        raise HTTPException(status_code=404, detail="No file uploaded for this Predictive Model")
    file_path = storage.STORAGE_DIR / stored_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    filename = Path(stored_path).name
    media_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    return FileResponse(file_path, filename=filename, media_type=media_type)
