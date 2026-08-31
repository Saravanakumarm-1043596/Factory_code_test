"""SQLAlchemy model for Clinician, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from sqlalchemy.orm import relationship

from app.database import Base


class Clinician(Base):
    __tablename__ = "clinicians"

    clinician_id = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    npi_number = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    ehr_source_system = Column(String, nullable=False)
    facility_id = Column(String, ForeignKey("facilities.facility_id"), nullable=False)
    status = Column(String, nullable=False)
    max_daily_appointments = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    facility = relationship("Facility")
