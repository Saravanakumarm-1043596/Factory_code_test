from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class PhiAccessLogBase(BaseModel):
    user_id: int
    entity_type: Literal['Member', 'LabTestOrder', 'LabTestLine', 'Claim']
    entity_record_id: int
    access_type: Literal['View', 'Create', 'Update', 'Delete', 'Export', 'Print']
    source_system: Literal['Facets', 'Epic', 'This Application']
    access_reason: Literal['Treatment', 'Payment', 'Operations', 'Audit', 'Member Request', 'Legal']
    ip_address: Optional[str] = None
    access_timestamp: datetime
    phi_fields_accessed: Optional[str] = None
    was_authorized: bool
    notes: Optional[str] = None


class PhiAccessLogCreate(PhiAccessLogBase):
    pass


class PhiAccessLogUpdate(BaseModel):
    user_id: Optional[int] = None
    entity_type: Optional[Literal['Member', 'LabTestOrder', 'LabTestLine', 'Claim']] = None
    entity_record_id: Optional[int] = None
    access_type: Optional[Literal['View', 'Create', 'Update', 'Delete', 'Export', 'Print']] = None
    source_system: Optional[Literal['Facets', 'Epic', 'This Application']] = None
    access_reason: Optional[Literal['Treatment', 'Payment', 'Operations', 'Audit', 'Member Request', 'Legal']] = None
    ip_address: Optional[str] = None
    access_timestamp: Optional[datetime] = None
    phi_fields_accessed: Optional[str] = None
    was_authorized: Optional[bool] = None
    notes: Optional[str] = None


class PhiAccessLogRead(PhiAccessLogBase):
    model_config = ConfigDict(from_attributes=True)

    phi_access_log_id: int
