"""SQLAlchemy model for PhiaccessLog, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Boolean, DateTime, ForeignKey, String

from sqlalchemy.orm import relationship

from app.database import Base


class PhiaccessLog(Base):
    __tablename__ = "phiaccess_logs"

    phi_access_log_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("app_users.app_user_id"), nullable=False)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=False)
    action = Column(String, nullable=False)
    access_reason = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    ehr_source_system = Column(String, nullable=True)
    access_granted = Column(Boolean, nullable=False)
    denial_reason = Column(String, nullable=True)
    accessed_at = Column(DateTime, nullable=False)

    user = relationship("AppUser")
    patient = relationship("Patient")
