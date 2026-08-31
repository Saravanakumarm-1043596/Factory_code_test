from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class RuleIssueBase(BaseModel):
    firewall_rule_id: int
    related_rule_id: Optional[int] = None
    issue_type: Literal['Redundant', 'Shadowed', 'Conflicting', 'Overly Permissive', 'Orphaned', 'Expired']
    severity: Literal['Critical', 'High', 'Medium', 'Low', 'Informational']
    status: Literal['Open', 'Acknowledged', 'In Remediation', 'Resolved', 'Accepted Risk']
    description: str
    recommendation: Optional[str] = None
    phi_exposure_risk: bool
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None


class RuleIssueCreate(RuleIssueBase):
    pass


class RuleIssueUpdate(BaseModel):
    firewall_rule_id: Optional[int] = None
    related_rule_id: Optional[int] = None
    issue_type: Optional[Literal['Redundant', 'Shadowed', 'Conflicting', 'Overly Permissive', 'Orphaned', 'Expired']] = None
    severity: Optional[Literal['Critical', 'High', 'Medium', 'Low', 'Informational']] = None
    status: Optional[Literal['Open', 'Acknowledged', 'In Remediation', 'Resolved', 'Accepted Risk']] = None
    description: Optional[str] = None
    recommendation: Optional[str] = None
    phi_exposure_risk: Optional[bool] = None
    detected_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None


class RuleIssueRead(RuleIssueBase):
    model_config = ConfigDict(from_attributes=True)

    rule_issue_id: int
