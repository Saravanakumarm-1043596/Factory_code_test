"""Service layer for ScanFinding: delegates to the repository. This is the
layer routes.py talks to -- keeps request handlers free of persistence
details and gives business rules an obvious home if they're needed later."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.scan_finding import ScanFinding
from app.repositories import scan_finding_repository as repository


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[ScanFinding]:
    return repository.list_all(db, skip=skip, limit=limit)


def count_all(db: Session) -> int:
    return repository.count_all(db)


def get_by_id(db: Session, item_id: int) -> ScanFinding | None:
    return repository.get_by_id(db, item_id)


def create(db: Session, data: dict) -> ScanFinding:
    return repository.create(db, data)


def update(db: Session, item_id: int, data: dict) -> ScanFinding | None:
    return repository.update(db, item_id, data)


def delete(db: Session, item_id: int) -> bool:
    return repository.delete(db, item_id)
