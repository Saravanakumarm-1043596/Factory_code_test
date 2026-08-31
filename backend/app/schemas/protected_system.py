from __future__ import annotations

from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ProtectedSystemBase(BaseModel):
    name: str
    system_type: Literal['Facets', 'Epic', 'Data Warehouse', 'Integration Engine', 'Portal', 'Other']
    environment: Literal['Production', 'Staging', 'Development', 'DR']
    contains_phi: bool
    data_classification: Literal['Restricted', 'Confidential', 'Internal', 'Public']
    owner: str
    ip_range: Optional[str] = None
    compliance_scope: Literal['HIPAA', 'HITRUST', 'SOC2', 'Multiple']
    last_assessment_date: Optional[date] = None
    notes: Optional[str] = None


class ProtectedSystemCreate(ProtectedSystemBase):
    pass


class ProtectedSystemUpdate(BaseModel):
    name: Optional[str] = None
    system_type: Optional[Literal['Facets', 'Epic', 'Data Warehouse', 'Integration Engine', 'Portal', 'Other']] = None
    environment: Optional[Literal['Production', 'Staging', 'Development', 'DR']] = None
    contains_phi: Optional[bool] = None
    data_classification: Optional[Literal['Restricted', 'Confidential', 'Internal', 'Public']] = None
    owner: Optional[str] = None
    ip_range: Optional[str] = None
    compliance_scope: Optional[Literal['HIPAA', 'HITRUST', 'SOC2', 'Multiple']] = None
    last_assessment_date: Optional[date] = None
    notes: Optional[str] = None


class ProtectedSystemRead(ProtectedSystemBase):
    model_config = ConfigDict(from_attributes=True)

    protected_system_id: int
