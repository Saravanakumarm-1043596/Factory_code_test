from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class AuditScanBase(BaseModel):
    scan_name: str
    scan_type: Literal['Full', 'Incremental', 'Targeted', 'Compliance']
    status: Literal['Scheduled', 'Running', 'Completed', 'Failed']
    scope_description: Optional[str] = None
    total_rules_analyzed: Optional[int] = None
    issues_found: Optional[int] = None
    critical_issues_found: Optional[int] = None
    initiated_by: str
    started_at: datetime
    completed_at: Optional[datetime] = None


class AuditScanCreate(AuditScanBase):
    pass


class AuditScanUpdate(BaseModel):
    scan_name: Optional[str] = None
    scan_type: Optional[Literal['Full', 'Incremental', 'Targeted', 'Compliance']] = None
    status: Optional[Literal['Scheduled', 'Running', 'Completed', 'Failed']] = None
    scope_description: Optional[str] = None
    total_rules_analyzed: Optional[int] = None
    issues_found: Optional[int] = None
    critical_issues_found: Optional[int] = None
    initiated_by: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class AuditScanRead(AuditScanBase):
    model_config = ConfigDict(from_attributes=True)

    audit_scan_id: int
    report_file_url: Optional[str] = None
