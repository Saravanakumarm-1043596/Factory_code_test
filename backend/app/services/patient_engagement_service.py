"""Service layer for PatientEngagement: delegates to the repository. This is the
layer routes.py talks to -- keeps request handlers free of persistence
details and gives business rules an obvious home if they're needed later."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.patient_engagement import PatientEngagement
from app.repositories import patient_engagement_repository as repository


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[PatientEngagement]:
    return repository.list_all(db, skip=skip, limit=limit)


def count_all(db: Session) -> int:
    return repository.count_all(db)


def get_by_id(db: Session, item_id: str) -> PatientEngagement | None:
    return repository.get_by_id(db, item_id)


def create(db: Session, data: dict) -> PatientEngagement:
    return repository.create(db, data)


def update(db: Session, item_id: str, data: dict) -> PatientEngagement | None:
    return repository.update(db, item_id, data)


def delete(db: Session, item_id: str) -> bool:
    return repository.delete(db, item_id)
