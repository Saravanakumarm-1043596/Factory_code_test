from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class FacilityBase(BaseModel):
    name: str
    address: str
    city: str
    state: str
    zip_code: str
    phone_number: str
    ehr_source_system: Literal['Epic', 'Cerner', 'Both']
    facility_type: Literal['Hospital', 'Outpatient Clinic', 'Urgent Care', 'Telehealth Hub', 'Specialty Center']
    status: Literal['Open', 'Closed', 'Under Renovation']
    created_at: datetime


class FacilityCreate(FacilityBase):
    pass


class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone_number: Optional[str] = None
    ehr_source_system: Optional[Literal['Epic', 'Cerner', 'Both']] = None
    facility_type: Optional[Literal['Hospital', 'Outpatient Clinic', 'Urgent Care', 'Telehealth Hub', 'Specialty Center']] = None
    status: Optional[Literal['Open', 'Closed', 'Under Renovation']] = None
    created_at: Optional[datetime] = None


class FacilityRead(FacilityBase):
    model_config = ConfigDict(from_attributes=True)

    facility_id: str
