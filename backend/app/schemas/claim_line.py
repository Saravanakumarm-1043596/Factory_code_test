from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ClaimLineBase(BaseModel):
    claim_id: int
    line_number: int
    cpt_code: str
    modifier: Optional[str] = None
    icd10_pointer: Optional[str] = None
    units: int
    billed_amount: float
    allowed_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    line_status: Literal['Approved', 'Denied', 'Pended', 'Adjusted']
    denial_reason_code: Optional[Literal['Duplicate Claim', 'Not Covered', 'Missing Information', 'Out of Network', 'Timely Filing']] = None
    lab_test_line_id: Optional[int] = None
    created_at: datetime


class ClaimLineCreate(ClaimLineBase):
    pass


class ClaimLineUpdate(BaseModel):
    claim_id: Optional[int] = None
    line_number: Optional[int] = None
    cpt_code: Optional[str] = None
    modifier: Optional[str] = None
    icd10_pointer: Optional[str] = None
    units: Optional[int] = None
    billed_amount: Optional[float] = None
    allowed_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    line_status: Optional[Literal['Approved', 'Denied', 'Pended', 'Adjusted']] = None
    denial_reason_code: Optional[Literal['Duplicate Claim', 'Not Covered', 'Missing Information', 'Out of Network', 'Timely Filing']] = None
    lab_test_line_id: Optional[int] = None
    created_at: Optional[datetime] = None


class ClaimLineRead(ClaimLineBase):
    model_config = ConfigDict(from_attributes=True)

    claim_line_id: int
