"""Service layer for PredictiveModel: delegates to the repository. This is the
layer routes.py talks to -- keeps request handlers free of persistence
details and gives business rules an obvious home if they're needed later."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.predictive_model import PredictiveModel
from app.repositories import predictive_model_repository as repository


def list_all(db: Session, skip: int = 0, limit: int = 100) -> list[PredictiveModel]:
    return repository.list_all(db, skip=skip, limit=limit)


def count_all(db: Session) -> int:
    return repository.count_all(db)


def get_by_id(db: Session, item_id: str) -> PredictiveModel | None:
    return repository.get_by_id(db, item_id)


def create(db: Session, data: dict) -> PredictiveModel:
    return repository.create(db, data)


def update(db: Session, item_id: str, data: dict) -> PredictiveModel | None:
    return repository.update(db, item_id, data)


def delete(db: Session, item_id: str) -> bool:
    return repository.delete(db, item_id)
