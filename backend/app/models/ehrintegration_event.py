"""SQLAlchemy model for EhrintegrationEvent, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class EhrintegrationEvent(Base):
    __tablename__ = "ehrintegration_events"

    ehr_integration_event_id = Column(String, primary_key=True, index=True)
    source_system = Column(String, nullable=False)
    direction = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    message_id = Column(String, nullable=False)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=True)
    appointment_id = Column(String, ForeignKey("appointments.appointment_id"), nullable=True)
    status = Column(String, nullable=False)
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, nullable=False)
    payload_file = Column(String, nullable=True)
    occurred_at = Column(DateTime, nullable=False)
    processed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False)

    patient = relationship("Patient")
    appointment = relationship("Appointment")
