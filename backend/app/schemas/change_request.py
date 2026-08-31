from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ChangeRequestBase(BaseModel):
    title: str
    description: str
    firewall_rule_set_id: int
    change_type: Literal['Add Rule', 'Modify Rule', 'Remove Rule', 'Consolidate Rules', 'Emergency Change']
    status: Literal['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Implemented', 'Rolled Back']
    priority: Literal['Critical', 'High', 'Medium', 'Low']
    requestor: str
    approver: Optional[str] = None
    justification: str
    risk_assessment: Optional[str] = None
    rule_issue_id: Optional[int] = None
    implementation_notes: Optional[str] = None
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    implemented_at: Optional[datetime] = None
    created_at: datetime


class ChangeRequestCreate(ChangeRequestBase):
    pass


class ChangeRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    firewall_rule_set_id: Optional[int] = None
    change_type: Optional[Literal['Add Rule', 'Modify Rule', 'Remove Rule', 'Consolidate Rules', 'Emergency Change']] = None
    status: Optional[Literal['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Implemented', 'Rolled Back']] = None
    priority: Optional[Literal['Critical', 'High', 'Medium', 'Low']] = None
    requestor: Optional[str] = None
    approver: Optional[str] = None
    justification: Optional[str] = None
    risk_assessment: Optional[str] = None
    rule_issue_id: Optional[int] = None
    implementation_notes: Optional[str] = None
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    implemented_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class ChangeRequestRead(ChangeRequestBase):
    model_config = ConfigDict(from_attributes=True)

    change_request_id: int
    attachment_url: Optional[str] = None
