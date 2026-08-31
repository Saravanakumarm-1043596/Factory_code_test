"""SQLAlchemy model for AuditScan, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database import Base


class AuditScan(Base):
    __tablename__ = "audit_scans"

    audit_scan_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    scan_name = Column(String, nullable=False)
    scan_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    scope_description = Column(Text, nullable=True)
    total_rules_analyzed = Column(Integer, nullable=True)
    issues_found = Column(Integer, nullable=True)
    critical_issues_found = Column(Integer, nullable=True)
    initiated_by = Column(String, nullable=False)
    report_file = Column(String, nullable=True)
    started_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)
