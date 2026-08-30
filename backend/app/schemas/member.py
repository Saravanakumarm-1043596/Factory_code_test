from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class MemberBase(BaseModel):
    facets_member_id: str
    epic_mrn: Optional[str] = None
    first_name: str
    last_name: str
    date_of_birth: date
    gender: Literal['Male', 'Female', 'Non-Binary', 'Unknown']
    email: Optional[str] = None
    phone: Optional[str] = None
    line_of_business_id: int
    plan_type: Literal['HMO', 'PPO', 'EPO', 'POS', 'MAPD', 'MA-Only']
    coverage_start_date: Literal['In Network', 'Out of Network', 'Not Covered']
    coverage_end_date: Optional[Literal['In Network', 'Out of Network', 'Not Covered']] = None
    member_status: Literal['Active', 'Inactive', 'Termed']
    created_at: datetime


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    facets_member_id: Optional[str] = None
    epic_mrn: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Literal['Male', 'Female', 'Non-Binary', 'Unknown']] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    line_of_business_id: Optional[int] = None
    plan_type: Optional[Literal['HMO', 'PPO', 'EPO', 'POS', 'MAPD', 'MA-Only']] = None
    coverage_start_date: Optional[Literal['In Network', 'Out of Network', 'Not Covered']] = None
    coverage_end_date: Optional[Literal['In Network', 'Out of Network', 'Not Covered']] = None
    member_status: Optional[Literal['Active', 'Inactive', 'Termed']] = None
    created_at: Optional[datetime] = None


class MemberRead(MemberBase):
    model_config = ConfigDict(from_attributes=True)

    member_id: int
