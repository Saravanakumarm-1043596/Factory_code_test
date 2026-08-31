from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ConsentRecordBase(BaseModel):
    patient_id: str
    consent_type: Literal['General Treatment', 'SMS Communication', 'Email Communication', 'Data Sharing', 'Research', 'Telehealth']
    status: Literal['Active', 'Revoked', 'Expired']
    granted_at: datetime
    expires_at: Optional[date] = None
    revoked_at: Optional[datetime] = None
    collected_by_user_id: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ConsentRecordCreate(ConsentRecordBase):
    pass


class ConsentRecordUpdate(BaseModel):
    patient_id: Optional[str] = None
    consent_type: Optional[Literal['General Treatment', 'SMS Communication', 'Email Communication', 'Data Sharing', 'Research', 'Telehealth']] = None
    status: Optional[Literal['Active', 'Revoked', 'Expired']] = None
    granted_at: Optional[datetime] = None
    expires_at: Optional[date] = None
    revoked_at: Optional[datetime] = None
    collected_by_user_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ConsentRecordRead(ConsentRecordBase):
    model_config = ConfigDict(from_attributes=True)

    consent_record_id: str
    consent_document_url: Optional[str] = None
