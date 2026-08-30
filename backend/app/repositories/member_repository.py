"""Repository layer for Member: raw SQLAlchemy CRUD, no business logic."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.member import Member


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[Member]:
    return db.query(Member).offset(skip).limit(limit).all()


def count_all(db: Session) -> int:
    return db.query(Member).count()


def get_by_id(db: Session, item_id: int) -> Member | None:
    return db.query(Member).filter(Member.member_id == item_id).first()


def create(db: Session, data: dict) -> Member:
    obj = Member(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def bulk_create(db: Session, rows: list[dict]) -> None:
    """Insert many rows in one transaction -- used by startup seeding,
    where callers don't need the created objects back (unlike create())."""
    db.add_all([Member(**row) for row in rows])
    db.commit()


def update(db: Session, item_id: int, data: dict) -> Member | None:
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
