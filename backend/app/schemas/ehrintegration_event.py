from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class EhrintegrationEventBase(BaseModel):
    source_system: Literal['Epic', 'Cerner']
    direction: Literal['Inbound', 'Outbound']
    event_type: Literal['ADT', 'SIU (Schedule)', 'ORM (Order)', 'MDM (Document)', 'Patient Sync', 'Slot Sync']
    message_id: str
    patient_id: Optional[str] = None
    appointment_id: Optional[str] = None
    status: Literal['Received', 'Processing', 'Succeeded', 'Failed', 'Retrying']
    error_message: Optional[str] = None
    retry_count: int
    occurred_at: datetime
    processed_at: Optional[datetime] = None
    created_at: datetime


class EhrintegrationEventCreate(EhrintegrationEventBase):
    pass


class EhrintegrationEventUpdate(BaseModel):
    source_system: Optional[Literal['Epic', 'Cerner']] = None
    direction: Optional[Literal['Inbound', 'Outbound']] = None
    event_type: Optional[Literal['ADT', 'SIU (Schedule)', 'ORM (Order)', 'MDM (Document)', 'Patient Sync', 'Slot Sync']] = None
    message_id: Optional[str] = None
    patient_id: Optional[str] = None
    appointment_id: Optional[str] = None
    status: Optional[Literal['Received', 'Processing', 'Succeeded', 'Failed', 'Retrying']] = None
    error_message: Optional[str] = None
    retry_count: Optional[int] = None
    occurred_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class EhrintegrationEventRead(EhrintegrationEventBase):
    model_config = ConfigDict(from_attributes=True)

    ehr_integration_event_id: str
    payload_file_url: Optional[str] = None
