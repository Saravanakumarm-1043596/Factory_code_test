"""SQLAlchemy model for NetworkSecurityGroup, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database import Base


class NetworkSecurityGroup(Base):
    __tablename__ = "network_security_groups"

    network_security_group_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String, nullable=False)
    azure_resource_id = Column(String, nullable=False)
    subscription = Column(String, nullable=False)
    resource_group = Column(String, nullable=False)
    region = Column(String, nullable=False)
    associated_subnet = Column(String, nullable=True)
    associated_nic = Column(String, nullable=True)
    total_rule_count = Column(Integer, nullable=False)
    last_synced_at = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
