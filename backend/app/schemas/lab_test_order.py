from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class LabTestOrderBase(BaseModel):
    order_number: str
    member_id: int
    ordering_provider_id: int
    performing_lab_id: int
    line_of_business_id: int
    source_system: Literal['Facets', 'Epic', 'Manual Entry']
    order_status: Literal['Ordered', 'Specimen Collected', 'In Progress', 'Resulted', 'Cancelled', 'On Hold']
    priority: Literal['Routine', 'Urgent', 'STAT']
    clinical_indication: Optional[str] = None
    icd10_codes: Optional[str] = None
    order_date: datetime
    specimen_collection_date: Optional[datetime] = None
    result_date: Optional[datetime] = None
    prior_auth_required: bool
    prior_auth_number: Optional[Literal['Requested', 'Pending Review', 'Approved', 'Partially Approved', 'Denied']] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class LabTestOrderCreate(LabTestOrderBase):
    pass


class LabTestOrderUpdate(BaseModel):
    order_number: Optional[str] = None
    member_id: Optional[int] = None
    ordering_provider_id: Optional[int] = None
    performing_lab_id: Optional[int] = None
    line_of_business_id: Optional[int] = None
    source_system: Optional[Literal['Facets', 'Epic', 'Manual Entry']] = None
    order_status: Optional[Literal['Ordered', 'Specimen Collected', 'In Progress', 'Resulted', 'Cancelled', 'On Hold']] = None
    priority: Optional[Literal['Routine', 'Urgent', 'STAT']] = None
    clinical_indication: Optional[str] = None
    icd10_codes: Optional[str] = None
    order_date: Optional[datetime] = None
    specimen_collection_date: Optional[datetime] = None
    result_date: Optional[datetime] = None
    prior_auth_required: Optional[bool] = None
    prior_auth_number: Optional[Literal['Requested', 'Pending Review', 'Approved', 'Partially Approved', 'Denied']] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class LabTestOrderRead(LabTestOrderBase):
    model_config = ConfigDict(from_attributes=True)

    lab_test_order_id: int
