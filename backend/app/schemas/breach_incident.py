from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class BreachIncidentBase(BaseModel):
    reported_by_user_id: str
    severity: Literal['Low', 'Medium', 'High', 'Critical']
    breach_type: Literal['Unauthorized Access', 'Data Loss', 'Improper Disclosure', 'Theft', 'Hacking', 'Other']
    status: Literal['Reported', 'Under Investigation', 'Contained', 'Notified', 'Resolved', 'Closed']
    affected_patient_count: int
    description: str
    discovered_at: datetime
    reported_at: datetime
    hhs_notification_deadline: date
    hhs_notified_at: Optional[datetime] = None
    patient_notification_sent_at: Optional[datetime] = None
    root_cause: Optional[str] = None
    remediation_plan: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class BreachIncidentCreate(BreachIncidentBase):
    pass


class BreachIncidentUpdate(BaseModel):
    reported_by_user_id: Optional[str] = None
    severity: Optional[Literal['Low', 'Medium', 'High', 'Critical']] = None
    breach_type: Optional[Literal['Unauthorized Access', 'Data Loss', 'Improper Disclosure', 'Theft', 'Hacking', 'Other']] = None
    status: Optional[Literal['Reported', 'Under Investigation', 'Contained', 'Notified', 'Resolved', 'Closed']] = None
    affected_patient_count: Optional[int] = None
    description: Optional[str] = None
    discovered_at: Optional[datetime] = None
    reported_at: Optional[datetime] = None
    hhs_notification_deadline: Optional[date] = None
    hhs_notified_at: Optional[datetime] = None
    patient_notification_sent_at: Optional[datetime] = None
    root_cause: Optional[str] = None
    remediation_plan: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class BreachIncidentRead(BreachIncidentBase):
    model_config = ConfigDict(from_attributes=True)

    breach_incident_id: str
    supporting_document_url: Optional[str] = None
