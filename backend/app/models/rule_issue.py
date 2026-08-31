"""SQLAlchemy model for RuleIssue, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Boolean, DateTime, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class RuleIssue(Base):
    __tablename__ = "rule_issues"

    rule_issue_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    firewall_rule_id = Column(Integer, ForeignKey("firewall_rules.firewall_rule_id"), nullable=False)
    related_rule_id = Column(Integer, ForeignKey("firewall_rules.firewall_rule_id"), nullable=True)
    issue_type = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    status = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)
    phi_exposure_risk = Column(Boolean, nullable=False)
    detected_at = Column(DateTime, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    assigned_to = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    firewall_rule = relationship("FirewallRule")
    related_rule = relationship("FirewallRule")
