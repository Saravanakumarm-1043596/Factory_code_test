from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class AppointmentBase(BaseModel):
    patient_id: str
    clinician_id: str
    facility_id: str
    appointment_type: Literal['In-Person', 'Telehealth', 'Phone', 'Home Visit']
    visit_reason: Literal['New Patient', 'Follow-Up', 'Annual Wellness', 'Urgent', 'Procedure', 'Lab Review', 'Referral']
    scheduled_datetime: datetime
    duration_minutes: int
    status: Literal['Scheduled', 'Confirmed', 'Checked In', 'In Progress', 'Completed', 'No-Show', 'Cancelled', 'Rescheduled']
    no_show_risk_score: Optional[float] = None
    predicted_optimal_slot: Optional[datetime] = None
    ehr_source_system: Literal['Epic', 'Cerner']
    ehr_encounter_id: Optional[Literal['Office Visit', 'Telehealth', 'Inpatient', 'Emergency', 'Follow Up']] = None
    cancellation_reason: Optional[Literal['Patient Request', 'Clinician Unavailable', 'Insurance Issue', 'Weather', 'No Reason Given', 'System Rescheduled']] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    patient_id: Optional[str] = None
    clinician_id: Optional[str] = None
    facility_id: Optional[str] = None
    appointment_type: Optional[Literal['In-Person', 'Telehealth', 'Phone', 'Home Visit']] = None
    visit_reason: Optional[Literal['New Patient', 'Follow-Up', 'Annual Wellness', 'Urgent', 'Procedure', 'Lab Review', 'Referral']] = None
    scheduled_datetime: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: Optional[Literal['Scheduled', 'Confirmed', 'Checked In', 'In Progress', 'Completed', 'No-Show', 'Cancelled', 'Rescheduled']] = None
    no_show_risk_score: Optional[float] = None
    predicted_optimal_slot: Optional[datetime] = None
    ehr_source_system: Optional[Literal['Epic', 'Cerner']] = None
    ehr_encounter_id: Optional[Literal['Office Visit', 'Telehealth', 'Inpatient', 'Emergency', 'Follow Up']] = None
    cancellation_reason: Optional[Literal['Patient Request', 'Clinician Unavailable', 'Insurance Issue', 'Weather', 'No Reason Given', 'System Rescheduled']] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AppointmentRead(AppointmentBase):
    model_config = ConfigDict(from_attributes=True)

    appointment_id: str
