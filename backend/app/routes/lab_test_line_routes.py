"""REST routes for LabTestLine, mounted at /api/labtestlines."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.lab_test_line import LabTestLineCreate, LabTestLineRead, LabTestLineUpdate
from app.services import lab_test_line_service as service

router = APIRouter(prefix="/api/labtestlines", tags=["LabTestLine"])


@router.get("", response_model=list[LabTestLineRead])
def list_labTestLine(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=LabTestLineRead)
def get_labTestLine(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Lab Test Line not found")
    return obj


@router.post("", response_model=LabTestLineRead, status_code=status.HTTP_201_CREATED)
def create_labTestLine(payload: LabTestLineCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=LabTestLineRead)
def update_labTestLine(item_id: int, payload: LabTestLineUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Lab Test Line not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_labTestLine(item_id: int, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Lab Test Line not found")
    return None
