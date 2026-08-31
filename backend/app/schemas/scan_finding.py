from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ScanFindingBase(BaseModel):
    audit_scan_id: int
    rule_issue_id: Optional[int] = None
    firewall_rule_id: int
    finding_type: Literal['Redundant', 'Shadowed', 'Conflicting', 'Overly Permissive', 'Orphaned', 'Expired']
    severity: Literal['Critical', 'High', 'Medium', 'Low', 'Informational']
    detail: str
    auto_resolved: bool
    detected_at: datetime


class ScanFindingCreate(ScanFindingBase):
    pass


class ScanFindingUpdate(BaseModel):
    audit_scan_id: Optional[int] = None
    rule_issue_id: Optional[int] = None
    firewall_rule_id: Optional[int] = None
    finding_type: Optional[Literal['Redundant', 'Shadowed', 'Conflicting', 'Overly Permissive', 'Orphaned', 'Expired']] = None
    severity: Optional[Literal['Critical', 'High', 'Medium', 'Low', 'Informational']] = None
    detail: Optional[str] = None
    auto_resolved: Optional[bool] = None
    detected_at: Optional[datetime] = None


class ScanFindingRead(ScanFindingBase):
    model_config = ConfigDict(from_attributes=True)

    scan_finding_id: int
