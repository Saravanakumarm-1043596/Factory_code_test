from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class PredictiveModelBase(BaseModel):
    model_name: str
    model_version: str
    model_type: Literal['No-Show Prediction', 'Optimal Slot Recommendation', 'Overbooking Optimization', 'Demand Forecasting']
    status: Literal['Training', 'Validating', 'Active', 'Deprecated', 'Retired']
    accuracy_score: Optional[float] = None
    auc_roc_score: Optional[float] = None
    training_record_count: int
    trained_at: datetime
    deployed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class PredictiveModelCreate(PredictiveModelBase):
    pass


class PredictiveModelUpdate(BaseModel):
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    model_type: Optional[Literal['No-Show Prediction', 'Optimal Slot Recommendation', 'Overbooking Optimization', 'Demand Forecasting']] = None
    status: Optional[Literal['Training', 'Validating', 'Active', 'Deprecated', 'Retired']] = None
    accuracy_score: Optional[float] = None
    auc_roc_score: Optional[float] = None
    training_record_count: Optional[int] = None
    trained_at: Optional[datetime] = None
    deployed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PredictiveModelRead(PredictiveModelBase):
    model_config = ConfigDict(from_attributes=True)

    predictive_model_id: str
    model_artifact_url: Optional[str] = None
