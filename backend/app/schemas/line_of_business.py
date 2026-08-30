from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class LineOfBusinessBase(BaseModel):
    name: Literal['Commercial', 'Medicare Advantage']
    description: Optional[str] = None
    regulatory_framework: Literal['State DOI', 'CMS Federal']
    is_active: bool
    created_at: datetime


class LineOfBusinessCreate(LineOfBusinessBase):
    pass


class LineOfBusinessUpdate(BaseModel):
    name: Optional[Literal['Commercial', 'Medicare Advantage']] = None
    description: Optional[str] = None
    regulatory_framework: Optional[Literal['State DOI', 'CMS Federal']] = None
    is_active: Optional[bool] = None
    created_at: Optional[datetime] = None


class LineOfBusinessRead(LineOfBusinessBase):
    model_config = ConfigDict(from_attributes=True)

    line_of_business_id: int
