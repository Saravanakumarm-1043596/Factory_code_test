"""Repository layer for AuditScan: raw SQLAlchemy CRUD, no business logic."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.audit_scan import AuditScan


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[AuditScan]:
    return db.query(AuditScan).offset(skip).limit(limit).all()


def count_all(db: Session) -> int:
    return db.query(AuditScan).count()


def get_by_id(db: Session, item_id: int) -> AuditScan | None:
    return db.query(AuditScan).filter(AuditScan.audit_scan_id == item_id).first()


def create(db: Session, data: dict) -> AuditScan:
    obj = AuditScan(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def bulk_create(db: Session, rows: list[dict]) -> None:
    """Insert many rows in one transaction -- used by startup seeding,
    where callers don't need the created objects back (unlike create())."""
    db.add_all([AuditScan(**row) for row in rows])
    db.commit()


def update(db: Session, item_id: int, data: dict) -> AuditScan | None:
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
