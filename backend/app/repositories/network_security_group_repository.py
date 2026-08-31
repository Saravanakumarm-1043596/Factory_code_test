"""Repository layer for NetworkSecurityGroup: raw SQLAlchemy CRUD, no business logic."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.network_security_group import NetworkSecurityGroup


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[NetworkSecurityGroup]:
    return db.query(NetworkSecurityGroup).offset(skip).limit(limit).all()


def count_all(db: Session) -> int:
    return db.query(NetworkSecurityGroup).count()


def get_by_id(db: Session, item_id: int) -> NetworkSecurityGroup | None:
    return db.query(NetworkSecurityGroup).filter(NetworkSecurityGroup.network_security_group_id == item_id).first()


def create(db: Session, data: dict) -> NetworkSecurityGroup:
    obj = NetworkSecurityGroup(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def bulk_create(db: Session, rows: list[dict]) -> None:
    """Insert many rows in one transaction -- used by startup seeding,
    where callers don't need the created objects back (unlike create())."""
    db.add_all([NetworkSecurityGroup(**row) for row in rows])
    db.commit()


def update(db: Session, item_id: int, data: dict) -> NetworkSecurityGroup | None:
    obj = get_by_id(db, item_id)
    if obj is None:
        return None
    for key, value in data.items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, item_id: int) -> bool:
    obj = get_by_id(db, item_id)
    if obj is None:
        return False
    db.delete(obj)
    db.commit()
    return True
