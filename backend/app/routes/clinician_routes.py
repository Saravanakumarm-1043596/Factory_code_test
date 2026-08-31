"""REST routes for Clinician, mounted at /api/clinicians."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.clinician import ClinicianCreate, ClinicianRead, ClinicianUpdate
from app.services import clinician_service as service

router = APIRouter(prefix="/api/clinicians", tags=["Clinician"])


@router.get("", response_model=list[ClinicianRead])
def list_clinician(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=ClinicianRead)
def get_clinician(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Clinician not found")
    return obj


@router.post("", response_model=ClinicianRead, status_code=status.HTTP_201_CREATED)
def create_clinician(payload: ClinicianCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=ClinicianRead)
def update_clinician(item_id: str, payload: ClinicianUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Clinician not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_clinician(item_id: str, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Clinician not found")
    return None
