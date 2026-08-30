from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ClaimBase(BaseModel):
    claim_number: str
    lab_test_order_id: int
    member_id: int
    rendering_provider_id: int
    line_of_business_id: int
    source_system: Literal['Facets', 'Epic', 'Manual']
    claim_type: Literal['Professional', 'Institutional']
    claim_status: Literal['Submitted', 'Pending Review', 'Approved', 'Denied', 'Pended', 'Adjusted', 'Reprocessed']
    total_billed_amount: float
    total_allowed_amount: Optional[float] = None
    total_paid_amount: Optional[float] = None
    member_responsibility: Optional[float] = None
    service_date: date
    submitted_date: datetime
    adjudicated_date: Optional[datetime] = None
    has_error: bool
    denial_reason_code: Optional[Literal['Duplicate Claim', 'Not Covered', 'Missing Information', 'Out of Network', 'Timely Filing']] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ClaimCreate(ClaimBase):
    pass


class ClaimUpdate(BaseModel):
    claim_number: Optional[str] = None
    lab_test_order_id: Optional[int] = None
    member_id: Optional[int] = None
    rendering_provider_id: Optional[int] = None
    line_of_business_id: Optional[int] = None
    source_system: Optional[Literal['Facets', 'Epic', 'Manual']] = None
    claim_type: Optional[Literal['Professional', 'Institutional']] = None
    claim_status: Optional[Literal['Submitted', 'Pending Review', 'Approved', 'Denied', 'Pended', 'Adjusted', 'Reprocessed']] = None
    total_billed_amount: Optional[float] = None
    total_allowed_amount: Optional[float] = None
    total_paid_amount: Optional[float] = None
    member_responsibility: Optional[float] = None
    service_date: Optional[date] = None
    submitted_date: Optional[datetime] = None
    adjudicated_date: Optional[datetime] = None
    has_error: Optional[bool] = None
    denial_reason_code: Optional[Literal['Duplicate Claim', 'Not Covered', 'Missing Information', 'Out of Network', 'Timely Filing']] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ClaimRead(ClaimBase):
    model_config = ConfigDict(from_attributes=True)

    claim_id: int
