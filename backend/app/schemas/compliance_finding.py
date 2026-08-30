from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ComplianceFindingBase(BaseModel):
    compliance_control_id: int
    finding_type: Literal['Gap', 'Violation', 'Observation', 'Improvement Opportunity']
    severity: Literal['Low', 'Medium', 'High', 'Critical']
    description: str
    affected_system: Literal['Facets', 'Epic', 'Cross-System', 'This Application']
    affected_line_of_business_id: Optional[int] = None
    status: Literal['Open', 'In Remediation', 'Remediated', 'Accepted Risk', 'Closed']
    assigned_to: Optional[str] = None
    remediation_plan: Optional[Literal['Gold PPO', 'Silver HMO', 'Bronze EPO', 'Medicare Advantage', 'Medicaid Managed Care']] = None
    due_date: Optional[date] = None
    found_date: datetime
    resolved_date: Optional[datetime] = None
    created_at: datetime


class ComplianceFindingCreate(ComplianceFindingBase):
    pass


class ComplianceFindingUpdate(BaseModel):
    compliance_control_id: Optional[int] = None
    finding_type: Optional[Literal['Gap', 'Violation', 'Observation', 'Improvement Opportunity']] = None
    severity: Optional[Literal['Low', 'Medium', 'High', 'Critical']] = None
    description: Optional[str] = None
    affected_system: Optional[Literal['Facets', 'Epic', 'Cross-System', 'This Application']] = None
    affected_line_of_business_id: Optional[int] = None
    status: Optional[Literal['Open', 'In Remediation', 'Remediated', 'Accepted Risk', 'Closed']] = None
    assigned_to: Optional[str] = None
    remediation_plan: Optional[Literal['Gold PPO', 'Silver HMO', 'Bronze EPO', 'Medicare Advantage', 'Medicaid Managed Care']] = None
    due_date: Optional[date] = None
    found_date: Optional[datetime] = None
    resolved_date: Optional[datetime] = None
    created_at: Optional[datetime] = None


class ComplianceFindingRead(ComplianceFindingBase):
    model_config = ConfigDict(from_attributes=True)

    compliance_finding_id: int
    evidence_attachment_url: Optional[str] = None
