"""REST routes for Facility, mounted at /api/facilities."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.facility import FacilityCreate, FacilityRead, FacilityUpdate
from app.services import facility_service as service

router = APIRouter(prefix="/api/facilities", tags=["Facility"])


@router.get("", response_model=list[FacilityRead])
def list_facility(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=FacilityRead)
def get_facility(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Facility not found")
    return obj


@router.post("", response_model=FacilityRead, status_code=status.HTTP_201_CREATED)
def create_facility(payload: FacilityCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=FacilityRead)
def update_facility(item_id: str, payload: FacilityUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Facility not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_facility(item_id: str, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Facility not found")
    return None
