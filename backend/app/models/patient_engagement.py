"""SQLAlchemy model for PatientEngagement, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, ForeignKey, String

from sqlalchemy.orm import relationship

from app.database import Base


class PatientEngagement(Base):
    __tablename__ = "patient_engagements"

    patient_engagement_id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False)
    appointment_id = Column(String, ForeignKey("appointments.appointment_id"), nullable=False)
    channel = Column(String, nullable=False)
    engagement_type = Column(String, nullable=False)
    sent_at = Column(DateTime, nullable=False)
    delivered_at = Column(DateTime, nullable=True)
    patient_response = Column(String, nullable=True)
    response_at = Column(DateTime, nullable=True)
    status = Column(String, nullable=False)
    template_name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

    patient = relationship("Patient")
    appointment = relationship("Appointment")
