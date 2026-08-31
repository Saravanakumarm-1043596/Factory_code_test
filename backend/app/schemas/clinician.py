from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ClinicianBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    npi_number: str
    specialty: Literal['Primary Care', 'Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics', 'OB-GYN', 'Psychiatry', 'Dermatology', 'Oncology', 'Other']
    ehr_source_system: Literal['Epic', 'Cerner']
    facility_id: str
    status: Literal['Active', 'On Leave', 'Inactive']
    max_daily_appointments: int
    created_at: datetime
    updated_at: datetime


class ClinicianCreate(ClinicianBase):
    pass


class ClinicianUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    npi_number: Optional[str] = None
    specialty: Optional[Literal['Primary Care', 'Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics', 'OB-GYN', 'Psychiatry', 'Dermatology', 'Oncology', 'Other']] = None
    ehr_source_system: Optional[Literal['Epic', 'Cerner']] = None
    facility_id: Optional[str] = None
    status: Optional[Literal['Active', 'On Leave', 'Inactive']] = None
    max_daily_appointments: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ClinicianRead(ClinicianBase):
    model_config = ConfigDict(from_attributes=True)

    clinician_id: str
