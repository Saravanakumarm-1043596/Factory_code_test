"""Service layer for ScheduleSlot: delegates to the repository. This is the
layer routes.py talks to -- keeps request handlers free of persistence
details and gives business rules an obvious home if they're needed later."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.schedule_slot import ScheduleSlot
from app.repositories import schedule_slot_repository as repository


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[ScheduleSlot]:
    return repository.list_all(db, skip=skip, limit=limit)


def count_all(db: Session) -> int:
    return repository.count_all(db)


def get_by_id(db: Session, item_id: str) -> ScheduleSlot | None:
    return repository.get_by_id(db, item_id)


def create(db: Session, data: dict) -> ScheduleSlot:
    return repository.create(db, data)


def update(db: Session, item_id: str, data: dict) -> ScheduleSlot | None:
    return repository.update(db, item_id, data)


def delete(db: Session, item_id: str) -> bool:
    return repository.delete(db, item_id)
