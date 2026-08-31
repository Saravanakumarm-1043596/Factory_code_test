"""SQLAlchemy model for Appointment, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    appointment_id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False)
    clinician_id = Column(String, ForeignKey("clinicians.clinician_id"), nullable=False)
    facility_id = Column(String, ForeignKey("facilities.facility_id"), nullable=False)
    appointment_type = Column(String, nullable=False)
    visit_reason = Column(String, nullable=False)
    scheduled_datetime = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    no_show_risk_score = Column(Float, nullable=True)
    predicted_optimal_slot = Column(DateTime, nullable=True)
    ehr_source_system = Column(String, nullable=False)
    ehr_encounter_id = Column(String, nullable=True)
    cancellation_reason = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    patient = relationship("Patient")
    clinician = relationship("Clinician")
    facility = relationship("Facility")
