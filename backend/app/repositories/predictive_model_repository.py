"""Repository layer for PredictiveModel: raw SQLAlchemy CRUD, no business logic."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.predictive_model import PredictiveModel


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[PredictiveModel]:
    return db.query(PredictiveModel).offset(skip).limit(limit).all()


def count_all(db: Session) -> int:
    return db.query(PredictiveModel).count()


def get_by_id(db: Session, item_id: str) -> PredictiveModel | None:
    return db.query(PredictiveModel).filter(PredictiveModel.predictive_model_id == item_id).first()


def create(db: Session, data: dict) -> PredictiveModel:
    obj = PredictiveModel(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def bulk_create(db: Session, rows: list[dict]) -> None:
    """Insert many rows in one transaction -- used by startup seeding,
    where callers don't need the created objects back (unlike create())."""
    db.add_all([PredictiveModel(**row) for row in rows])
    db.commit()


def update(db: Session, item_id: str, data: dict) -> PredictiveModel | None:
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
