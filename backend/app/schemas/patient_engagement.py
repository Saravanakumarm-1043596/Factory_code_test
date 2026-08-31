from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class PatientEngagementBase(BaseModel):
    patient_id: str
    appointment_id: str
    channel: Literal['SMS', 'Email', 'Phone Call', 'Push Notification', 'Patient Portal', 'IVR']
    engagement_type: Literal['Reminder', 'Confirmation Request', 'Reschedule Offer', 'Pre-Visit Instructions', 'Post-Visit Follow-Up', 'No-Show Outreach', 'Survey']
    sent_at: datetime
    delivered_at: Optional[datetime] = None
    patient_response: Optional[Literal['Confirmed', 'Rescheduled', 'Cancelled', 'No Response', 'Opted Out']] = None
    response_at: Optional[datetime] = None
    status: Literal['Pending', 'Sent', 'Delivered', 'Failed', 'Responded']
    template_name: str
    created_at: datetime


class PatientEngagementCreate(PatientEngagementBase):
    pass


class PatientEngagementUpdate(BaseModel):
    patient_id: Optional[str] = None
    appointment_id: Optional[str] = None
    channel: Optional[Literal['SMS', 'Email', 'Phone Call', 'Push Notification', 'Patient Portal', 'IVR']] = None
    engagement_type: Optional[Literal['Reminder', 'Confirmation Request', 'Reschedule Offer', 'Pre-Visit Instructions', 'Post-Visit Follow-Up', 'No-Show Outreach', 'Survey']] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    patient_response: Optional[Literal['Confirmed', 'Rescheduled', 'Cancelled', 'No Response', 'Opted Out']] = None
    response_at: Optional[datetime] = None
    status: Optional[Literal['Pending', 'Sent', 'Delivered', 'Failed', 'Responded']] = None
    template_name: Optional[str] = None
    created_at: Optional[datetime] = None


class PatientEngagementRead(PatientEngagementBase):
    model_config = ConfigDict(from_attributes=True)

    patient_engagement_id: str
