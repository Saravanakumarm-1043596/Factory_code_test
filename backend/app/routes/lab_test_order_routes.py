"""REST routes for LabTestOrder, mounted at /api/labtestorders."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.lab_test_order import LabTestOrderCreate, LabTestOrderRead, LabTestOrderUpdate
from app.services import lab_test_order_service as service

router = APIRouter(prefix="/api/labtestorders", tags=["LabTestOrder"])


@router.get("", response_model=list[LabTestOrderRead])
def list_labTestOrder(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=LabTestOrderRead)
def get_labTestOrder(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Lab Test Order not found")
    return obj


@router.post("", response_model=LabTestOrderRead, status_code=status.HTTP_201_CREATED)
def create_labTestOrder(payload: LabTestOrderCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=LabTestOrderRead)
def update_labTestOrder(item_id: int, payload: LabTestOrderUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Lab Test Order not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_labTestOrder(item_id: int, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Lab Test Order not found")
    return None
