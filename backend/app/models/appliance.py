"""SQLAlchemy model for Appliance, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database import Base


class Appliance(Base):
    __tablename__ = "appliances"

    appliance_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String, nullable=False)
    appliance_type = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    hostname = Column(String, nullable=True)
    environment = Column(String, nullable=False)
    firmware_version = Column(String, nullable=True)
    total_rule_count = Column(Integer, nullable=False)
    last_synced_at = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
