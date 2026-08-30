"""Service layer for LineOfBusiness: delegates to the repository. This is the
layer routes.py talks to -- keeps request handlers free of persistence
details and gives business rules an obvious home if they're needed later."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.line_of_business import LineOfBusiness
from app.repositories import line_of_business_repository as repository


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[LineOfBusiness]:
    return repository.list_all(db, skip=skip, limit=limit)


def count_all(db: Session) -> int:
    return repository.count_all(db)


def get_by_id(db: Session, item_id: int) -> LineOfBusiness | None:
    return repository.get_by_id(db, item_id)


def create(db: Session, data: dict) -> LineOfBusiness:
    return repository.create(db, data)


def update(db: Session, item_id: int, data: dict) -> LineOfBusiness | None:
    return repository.update(db, item_id, data)


def delete(db: Session, item_id: int) -> bool:
    return repository.delete(db, item_id)
