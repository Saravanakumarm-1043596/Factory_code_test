"""SQLAlchemy model for ChangeRequest, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class ChangeRequest(Base):
    __tablename__ = "change_requests"

    change_request_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    firewall_rule_set_id = Column(Integer, ForeignKey("firewall_rule_sets.firewall_rule_set_id"), nullable=False)
    change_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    requestor = Column(String, nullable=False)
    approver = Column(String, nullable=True)
    justification = Column(Text, nullable=False)
    risk_assessment = Column(Text, nullable=True)
    rule_issue_id = Column(Integer, ForeignKey("rule_issues.rule_issue_id"), nullable=True)
    implementation_notes = Column(Text, nullable=True)
    attachment = Column(String, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    implemented_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False)

    firewall_rule_set = relationship("FirewallRuleSet")
    rule_issue = relationship("RuleIssue")
