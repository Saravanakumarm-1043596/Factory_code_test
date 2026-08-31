"""SQLAlchemy model for FirewallRule, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Boolean, DateTime, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class FirewallRule(Base):
    __tablename__ = "firewall_rules"

    firewall_rule_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    firewall_rule_set_id = Column(Integer, ForeignKey("firewall_rule_sets.firewall_rule_set_id"), nullable=False)
    rule_name = Column(String, nullable=False)
    priority = Column(Integer, nullable=False)
    direction = Column(String, nullable=False)
    action = Column(String, nullable=False)
    protocol = Column(String, nullable=False)
    source_address = Column(String, nullable=False)
    source_port_range = Column(String, nullable=False)
    destination_address = Column(String, nullable=False)
    destination_port_range = Column(String, nullable=False)
    is_enabled = Column(Boolean, nullable=False)
    description = Column(Text, nullable=True)
    last_hit_at = Column(DateTime, nullable=True)
    hit_count = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=False)

    firewall_rule_set = relationship("FirewallRuleSet")
