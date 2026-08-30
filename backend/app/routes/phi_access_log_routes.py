"""REST routes for PhiAccessLog, mounted at /api/phiaccesslogs."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.phi_access_log import PhiAccessLogCreate, PhiAccessLogRead, PhiAccessLogUpdate
from app.services import phi_access_log_service as service

router = APIRouter(prefix="/api/phiaccesslogs", tags=["PhiAccessLog"])


@router.get("", response_model=list[PhiAccessLogRead])
def list_phiAccessLog(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=PhiAccessLogRead)
def get_phiAccessLog(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Phi Access Log not found")
    return obj


@router.post("", response_model=PhiAccessLogRead, status_code=status.HTTP_201_CREATED)
def create_phiAccessLog(payload: PhiAccessLogCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=PhiAccessLogRead)
def update_phiAccessLog(item_id: int, payload: PhiAccessLogUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Phi Access Log not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_phiAccessLog(item_id: int, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Phi Access Log not found")
    return None
