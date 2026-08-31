"""SQLAlchemy model for Patient, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Date, DateTime, Float, String

from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone_number = Column(String, nullable=False)
    preferred_contact_method = Column(String, nullable=False)
    preferred_language = Column(String, nullable=False)
    membership_status = Column(String, nullable=False)
    ehr_source_system = Column(String, nullable=False)
    ehr_medical_record_number = Column(String, nullable=False)
    no_show_risk_score = Column(Float, nullable=True)
    risk_score_updated_at = Column(DateTime, nullable=True)
    enrollment_date = Column(Date, nullable=False)
    consent_document = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
