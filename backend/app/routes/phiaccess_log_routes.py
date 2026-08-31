"""REST routes for PhiaccessLog, mounted at /api/phiaccesslogs."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.phiaccess_log import PhiaccessLogCreate, PhiaccessLogRead, PhiaccessLogUpdate
from app.services import phiaccess_log_service as service

router = APIRouter(prefix="/api/phiaccesslogs", tags=["PhiaccessLog"])


@router.get("", response_model=list[PhiaccessLogRead])
def list_phiaccessLog(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=PhiaccessLogRead)
def get_phiaccessLog(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Phiaccess Log not found")
    return obj


@router.post("", response_model=PhiaccessLogRead, status_code=status.HTTP_201_CREATED)
def create_phiaccessLog(payload: PhiaccessLogCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=PhiaccessLogRead)
def update_phiaccessLog(item_id: str, payload: PhiaccessLogUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Phiaccess Log not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_phiaccessLog(item_id: str, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Phiaccess Log not found")
    return None
