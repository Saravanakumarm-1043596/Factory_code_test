"""SQLAlchemy model for FirewallRuleSet, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class FirewallRuleSet(Base):
    __tablename__ = "firewall_rule_sets"

    firewall_rule_set_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    network_security_group_id = Column(Integer, ForeignKey("network_security_groups.network_security_group_id"), nullable=True)
    appliance_id = Column(Integer, ForeignKey("appliances.appliance_id"), nullable=True)
    protected_system_id = Column(Integer, ForeignKey("protected_systems.protected_system_id"), nullable=True)
    rule_count = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    last_reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    network_security_group = relationship("NetworkSecurityGroup")
    appliance = relationship("Appliance")
    protected_system = relationship("ProtectedSystem")
