"""REST routes for ScheduleSlot, mounted at /api/scheduleslots."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.schedule_slot import ScheduleSlotCreate, ScheduleSlotRead, ScheduleSlotUpdate
from app.services import schedule_slot_service as service

router = APIRouter(prefix="/api/scheduleslots", tags=["ScheduleSlot"])


@router.get("", response_model=list[ScheduleSlotRead])
def list_scheduleSlot(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=ScheduleSlotRead)
def get_scheduleSlot(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Schedule Slot not found")
    return obj


@router.post("", response_model=ScheduleSlotRead, status_code=status.HTTP_201_CREATED)
def create_scheduleSlot(payload: ScheduleSlotCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=ScheduleSlotRead)
def update_scheduleSlot(item_id: str, payload: ScheduleSlotUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Schedule Slot not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scheduleSlot(item_id: str, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Schedule Slot not found")
    return None
