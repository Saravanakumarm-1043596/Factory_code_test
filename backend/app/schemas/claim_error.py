from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ClaimErrorBase(BaseModel):
    claim_id: int
    claim_line_id: Optional[int] = None
    error_category: Literal['Coding Error', 'Duplicate Claim', 'Authorization Missing', 'Member Eligibility', 'Provider Credentialing', 'Data Mismatch', 'Timely Filing', 'Other']
    error_severity: Literal['Low', 'Medium', 'High', 'Critical']
    error_description: str
    source_system_origin: Literal['Facets', 'Epic', 'Cross-System']
    resolution_status: Literal['Open', 'In Review', 'Resolved', 'Escalated', 'Waived']
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    detected_date: datetime
    resolved_date: Optional[datetime] = None
    created_at: datetime


class ClaimErrorCreate(ClaimErrorBase):
    pass


class ClaimErrorUpdate(BaseModel):
    claim_id: Optional[int] = None
    claim_line_id: Optional[int] = None
    error_category: Optional[Literal['Coding Error', 'Duplicate Claim', 'Authorization Missing', 'Member Eligibility', 'Provider Credentialing', 'Data Mismatch', 'Timely Filing', 'Other']] = None
    error_severity: Optional[Literal['Low', 'Medium', 'High', 'Critical']] = None
    error_description: Optional[str] = None
    source_system_origin: Optional[Literal['Facets', 'Epic', 'Cross-System']] = None
    resolution_status: Optional[Literal['Open', 'In Review', 'Resolved', 'Escalated', 'Waived']] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    detected_date: Optional[datetime] = None
    resolved_date: Optional[datetime] = None
    created_at: Optional[datetime] = None


class ClaimErrorRead(ClaimErrorBase):
    model_config = ConfigDict(from_attributes=True)

    claim_error_id: int
