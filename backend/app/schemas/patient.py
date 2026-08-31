from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class PatientBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    gender: Literal['Male', 'Female', 'Non-Binary', 'Other', 'Prefer Not to Say']
    email: Optional[str] = None
    phone_number: str
    preferred_contact_method: Literal['Phone', 'Email', 'SMS', 'Patient Portal']
    preferred_language: Literal['English', 'Spanish', 'Mandarin', 'Other']
    membership_status: Literal['Active', 'Inactive', 'Suspended', 'Terminated']
    ehr_source_system: Literal['Epic', 'Cerner']
    ehr_medical_record_number: str
    no_show_risk_score: Optional[float] = None
    risk_score_updated_at: Optional[datetime] = None
    enrollment_date: date
    created_at: datetime
    updated_at: datetime


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Literal['Male', 'Female', 'Non-Binary', 'Other', 'Prefer Not to Say']] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_contact_method: Optional[Literal['Phone', 'Email', 'SMS', 'Patient Portal']] = None
    preferred_language: Optional[Literal['English', 'Spanish', 'Mandarin', 'Other']] = None
    membership_status: Optional[Literal['Active', 'Inactive', 'Suspended', 'Terminated']] = None
    ehr_source_system: Optional[Literal['Epic', 'Cerner']] = None
    ehr_medical_record_number: Optional[str] = None
    no_show_risk_score: Optional[float] = None
    risk_score_updated_at: Optional[datetime] = None
    enrollment_date: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PatientRead(PatientBase):
    model_config = ConfigDict(from_attributes=True)

    patient_id: str
    consent_document_url: Optional[str] = None
