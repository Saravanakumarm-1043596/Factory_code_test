from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ScheduleSlotBase(BaseModel):
    clinician_id: str
    facility_id: str
    slot_start: datetime
    slot_end: datetime
    slot_type: Literal['Standard', 'Overbook', 'Walk-In', 'Telehealth Only', 'Blocked']
    status: Literal['Available', 'Booked', 'Blocked', 'Completed']
    appointment_id: Optional[str] = None
    demand_score: Optional[float] = None
    created_at: datetime


class ScheduleSlotCreate(ScheduleSlotBase):
    pass


class ScheduleSlotUpdate(BaseModel):
    clinician_id: Optional[str] = None
    facility_id: Optional[str] = None
    slot_start: Optional[datetime] = None
    slot_end: Optional[datetime] = None
    slot_type: Optional[Literal['Standard', 'Overbook', 'Walk-In', 'Telehealth Only', 'Blocked']] = None
    status: Optional[Literal['Available', 'Booked', 'Blocked', 'Completed']] = None
    appointment_id: Optional[str] = None
    demand_score: Optional[float] = None
    created_at: Optional[datetime] = None


class ScheduleSlotRead(ScheduleSlotBase):
    model_config = ConfigDict(from_attributes=True)

    schedule_slot_id: str
