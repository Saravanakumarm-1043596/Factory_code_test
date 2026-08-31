from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class AppUserBase(BaseModel):
    email: str
    first_name: str
    last_name: str
    role: Literal['System Admin', 'Privacy Officer', 'Scheduling Manager', 'Clinician', 'Front Desk', 'Data Analyst', 'Read-Only Auditor']
    clinician_id: Optional[str] = None
    facility_id: Optional[str] = None
    status: Literal['Active', 'Locked', 'Deactivated']
    mfa_enabled: bool
    last_login_at: Optional[datetime] = None
    password_changed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class AppUserCreate(AppUserBase):
    pass


class AppUserUpdate(BaseModel):
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[Literal['System Admin', 'Privacy Officer', 'Scheduling Manager', 'Clinician', 'Front Desk', 'Data Analyst', 'Read-Only Auditor']] = None
    clinician_id: Optional[str] = None
    facility_id: Optional[str] = None
    status: Optional[Literal['Active', 'Locked', 'Deactivated']] = None
    mfa_enabled: Optional[bool] = None
    last_login_at: Optional[datetime] = None
    password_changed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AppUserRead(AppUserBase):
    model_config = ConfigDict(from_attributes=True)

    app_user_id: str
