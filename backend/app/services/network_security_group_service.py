"""Service layer for NetworkSecurityGroup: delegates to the repository. This is the
layer routes.py talks to -- keeps request handlers free of persistence
details and gives business rules an obvious home if they're needed later."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.network_security_group import NetworkSecurityGroup
from app.repositories import network_security_group_repository as repository


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[NetworkSecurityGroup]:
    return repository.list_all(db, skip=skip, limit=limit)


def count_all(db: Session) -> int:
    return repository.count_all(db)


def get_by_id(db: Session, item_id: int) -> NetworkSecurityGroup | None:
    return repository.get_by_id(db, item_id)


def create(db: Session, data: dict) -> NetworkSecurityGroup:
    return repository.create(db, data)


def update(db: Session, item_id: int, data: dict) -> NetworkSecurityGroup | None:
    return repository.update(db, item_id, data)


def delete(db: Session, item_id: int) -> bool:
    return repository.delete(db, item_id)
