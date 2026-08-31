"""SQLAlchemy model for PredictiveModel, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, Integer, String

from app.database import Base


class PredictiveModel(Base):
    __tablename__ = "predictive_models"

    predictive_model_id = Column(String, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    model_version = Column(String, nullable=False)
    model_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    accuracy_score = Column(Float, nullable=True)
    auc_roc_score = Column(Float, nullable=True)
    training_record_count = Column(Integer, nullable=False)
    trained_at = Column(DateTime, nullable=False)
    deployed_at = Column(DateTime, nullable=True)
    model_artifact = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
