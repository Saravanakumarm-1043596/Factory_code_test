"""SQLAlchemy model for ComplianceMapping, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class ComplianceMapping(Base):
    __tablename__ = "compliance_mappings"

    compliance_mapping_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    framework = Column(String, nullable=False)
    control_id = Column(String, nullable=False)
    control_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    protected_system_id = Column(Integer, ForeignKey("protected_systems.protected_system_id"), nullable=True)
    firewall_rule_set_id = Column(Integer, ForeignKey("firewall_rule_sets.firewall_rule_set_id"), nullable=True)
    compliance_status = Column(String, nullable=False)
    evidence_file = Column(String, nullable=True)
    last_assessed_at = Column(DateTime, nullable=True)
    assessor = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    protected_system = relationship("ProtectedSystem")
    firewall_rule_set = relationship("FirewallRuleSet")
