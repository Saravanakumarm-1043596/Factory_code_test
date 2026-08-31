"""Repository layer for Appointment: raw SQLAlchemy CRUD, no business logic."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.appointment import Appointment


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[Appointment]:
    return db.query(Appointment).offset(skip).limit(limit).all()


def count_all(db: Session) -> int:
    return db.query(Appointment).count()


def get_by_id(db: Session, item_id: str) -> Appointment | None:
    return db.query(Appointment).filter(Appointment.appointment_id == item_id).first()


def create(db: Session, data: dict) -> Appointment:
    obj = Appointment(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def bulk_create(db: Session, rows: list[dict]) -> None:
    """Insert many rows in one transaction -- used by startup seeding,
    where callers don't need the created objects back (unlike create())."""
    db.add_all([Appointment(**row) for row in rows])
    db.commit()


def update(db: Session, item_id: str, data: dict) -> Appointment | None:
    obj = get_by_id(db, item_id)
    if obj is None:
        return None
    for key, value in data.items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, item_id: str) -> bool:
    obj = get_by_id(db, item_id)
    if obj is None:
        return False
    db.delete(obj)
    db.commit()
    return True
