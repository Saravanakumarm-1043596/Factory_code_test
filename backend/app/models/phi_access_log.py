"""SQLAlchemy model for PhiAccessLog, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Boolean, DateTime, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class PhiAccessLog(Base):
    __tablename__ = "phi_access_logs"

    phi_access_log_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    entity_type = Column(String, nullable=False)
    entity_record_id = Column(Integer, nullable=False)
    access_type = Column(String, nullable=False)
    source_system = Column(String, nullable=False)
    access_reason = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    access_timestamp = Column(DateTime, nullable=False)
    phi_fields_accessed = Column(Text, nullable=True)
    was_authorized = Column(Boolean, nullable=False)
    notes = Column(Text, nullable=True)

    user = relationship("User")
