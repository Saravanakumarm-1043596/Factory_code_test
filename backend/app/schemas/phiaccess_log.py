from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class PhiaccessLogBase(BaseModel):
    user_id: str
    patient_id: str
    resource_type: Literal['Patient Record', 'Appointment', 'Engagement Record', 'Audit Report', 'Consent Document', 'Breach Record']
    resource_id: str
    action: Literal['View', 'Create', 'Update', 'Delete', 'Export', 'Print']
    access_reason: Literal['Treatment', 'Payment', 'Operations', 'Patient Request', 'Audit', 'Emergency']
    ip_address: str
    user_agent: Optional[str] = None
    ehr_source_system: Optional[Literal['Epic', 'Cerner', 'Internal']] = None
    access_granted: bool
    denial_reason: Optional[Literal['Insufficient Role', 'Break-the-Glass Required', 'Consent Not on File', 'Account Locked']] = None
    accessed_at: datetime


class PhiaccessLogCreate(PhiaccessLogBase):
    pass


class PhiaccessLogUpdate(BaseModel):
    user_id: Optional[str] = None
    patient_id: Optional[str] = None
    resource_type: Optional[Literal['Patient Record', 'Appointment', 'Engagement Record', 'Audit Report', 'Consent Document', 'Breach Record']] = None
    resource_id: Optional[str] = None
    action: Optional[Literal['View', 'Create', 'Update', 'Delete', 'Export', 'Print']] = None
    access_reason: Optional[Literal['Treatment', 'Payment', 'Operations', 'Patient Request', 'Audit', 'Emergency']] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    ehr_source_system: Optional[Literal['Epic', 'Cerner', 'Internal']] = None
    access_granted: Optional[bool] = None
    denial_reason: Optional[Literal['Insufficient Role', 'Break-the-Glass Required', 'Consent Not on File', 'Account Locked']] = None
    accessed_at: Optional[datetime] = None


class PhiaccessLogRead(PhiaccessLogBase):
    model_config = ConfigDict(from_attributes=True)

    phi_access_log_id: str
