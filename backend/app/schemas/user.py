from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class UserBase(BaseModel):
    username: str
    email: str
    first_name: str
    last_name: str
    role: Literal['Lab Admin', 'Claims Analyst', 'Compliance Officer', 'Supervisor', 'System Admin', 'Read Only']
    department: Literal['Lab Operations', 'Claims', 'Compliance', 'IT', 'Medical Management']
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[Literal['Lab Admin', 'Claims Analyst', 'Compliance Officer', 'Supervisor', 'System Admin', 'Read Only']] = None
    department: Optional[Literal['Lab Operations', 'Claims', 'Compliance', 'IT', 'Medical Management']] = None
    is_active: Optional[bool] = None
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
