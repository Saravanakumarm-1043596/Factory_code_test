"""REST routes for PatientEngagement, mounted at /api/patientengagements."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.patient_engagement import PatientEngagementCreate, PatientEngagementRead, PatientEngagementUpdate
from app.services import patient_engagement_service as service

router = APIRouter(prefix="/api/patientengagements", tags=["PatientEngagement"])


@router.get("", response_model=list[PatientEngagementRead])
def list_patientEngagement(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=PatientEngagementRead)
def get_patientEngagement(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Patient Engagement not found")
    return obj


@router.post("", response_model=PatientEngagementRead, status_code=status.HTTP_201_CREATED)
def create_patientEngagement(payload: PatientEngagementCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=PatientEngagementRead)
def update_patientEngagement(item_id: str, payload: PatientEngagementUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Patient Engagement not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patientEngagement(item_id: str, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Patient Engagement not found")
    return None
