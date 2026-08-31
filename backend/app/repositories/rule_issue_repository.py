"""Repository layer for RuleIssue: raw SQLAlchemy CRUD, no business logic."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.rule_issue import RuleIssue


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[RuleIssue]:
    return db.query(RuleIssue).offset(skip).limit(limit).all()


def count_all(db: Session) -> int:
    return db.query(RuleIssue).count()


def get_by_id(db: Session, item_id: int) -> RuleIssue | None:
    return db.query(RuleIssue).filter(RuleIssue.rule_issue_id == item_id).first()


def create(db: Session, data: dict) -> RuleIssue:
    obj = RuleIssue(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def bulk_create(db: Session, rows: list[dict]) -> None:
    """Insert many rows in one transaction -- used by startup seeding,
    where callers don't need the created objects back (unlike create())."""
    db.add_all([RuleIssue(**row) for row in rows])
    db.commit()


def update(db: Session, item_id: int, data: dict) -> RuleIssue | None:
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
