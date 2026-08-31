"""Service layer for Facility: delegates to the repository. This is the
layer routes.py talks to -- keeps request handlers free of persistence
details and gives business rules an obvious home if they're needed later."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.facility import Facility
from app.repositories import facility_repository as repository


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[Facility]:
    return repository.list_all(db, skip=skip, limit=limit)


def count_all(db: Session) -> int:
    return repository.count_all(db)


def get_by_id(db: Session, item_id: str) -> Facility | None:
    return repository.get_by_id(db, item_id)


def create(db: Session, data: dict) -> Facility:
    return repository.create(db, data)


def update(db: Session, item_id: str, data: dict) -> Facility | None:
    return repository.update(db, item_id, data)


def delete(db: Session, item_id: str) -> bool:
    return repository.delete(db, item_id)
