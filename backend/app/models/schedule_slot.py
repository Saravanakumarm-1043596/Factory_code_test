"""SQLAlchemy model for ScheduleSlot, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, ForeignKey, String

from sqlalchemy.orm import relationship

from app.database import Base


class ScheduleSlot(Base):
    __tablename__ = "schedule_slots"

    schedule_slot_id = Column(String, primary_key=True, index=True)
    clinician_id = Column(String, ForeignKey("clinicians.clinician_id"), nullable=False)
    facility_id = Column(String, ForeignKey("facilities.facility_id"), nullable=False)
    slot_start = Column(DateTime, nullable=False)
    slot_end = Column(DateTime, nullable=False)
    slot_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    appointment_id = Column(String, ForeignKey("appointments.appointment_id"), nullable=True)
    demand_score = Column(Float, nullable=True)
    created_at = Column(DateTime, nullable=False)

    clinician = relationship("Clinician")
    facility = relationship("Facility")
    appointment = relationship("Appointment")
