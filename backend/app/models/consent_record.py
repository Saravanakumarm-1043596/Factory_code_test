"""SQLAlchemy model for ConsentRecord, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Date, DateTime, ForeignKey, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class ConsentRecord(Base):
    __tablename__ = "consent_records"

    consent_record_id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False)
    consent_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    granted_at = Column(DateTime, nullable=False)
    expires_at = Column(Date, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    collected_by_user_id = Column(String, ForeignKey("app_users.app_user_id"), nullable=False)
    consent_document = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    patient = relationship("Patient")
    collected_by_user = relationship("AppUser")
