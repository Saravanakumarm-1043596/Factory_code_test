"""SQLAlchemy model for ScanFinding, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Boolean, DateTime, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class ScanFinding(Base):
    __tablename__ = "scan_findings"

    scan_finding_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    audit_scan_id = Column(Integer, ForeignKey("audit_scans.audit_scan_id"), nullable=False)
    rule_issue_id = Column(Integer, ForeignKey("rule_issues.rule_issue_id"), nullable=True)
    firewall_rule_id = Column(Integer, ForeignKey("firewall_rules.firewall_rule_id"), nullable=False)
    finding_type = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    detail = Column(Text, nullable=False)
    auto_resolved = Column(Boolean, nullable=False)
    detected_at = Column(DateTime, nullable=False)

    audit_scan = relationship("AuditScan")
    rule_issue = relationship("RuleIssue")
    firewall_rule = relationship("FirewallRule")
