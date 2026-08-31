"""REST routes for Appliance, mounted at /api/appliances."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.appliance import ApplianceCreate, ApplianceRead, ApplianceUpdate
from app.services import appliance_service as service

router = APIRouter(prefix="/api/appliances", tags=["Appliance"])


@router.get("", response_model=list[ApplianceRead])
def list_appliance(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=ApplianceRead)
def get_appliance(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Appliance not found")
    return obj


@router.post("", response_model=ApplianceRead, status_code=status.HTTP_201_CREATED)
def create_appliance(payload: ApplianceCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=ApplianceRead)
def update_appliance(item_id: int, payload: ApplianceUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Appliance not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appliance(item_id: int, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Appliance not found")
    return None
