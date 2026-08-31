"""SQLAlchemy model for AppUser, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Boolean, DateTime, ForeignKey, String

from sqlalchemy.orm import relationship

from app.database import Base


class AppUser(Base):
    __tablename__ = "app_users"

    app_user_id = Column(String, primary_key=True, index=True)
    email = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    clinician_id = Column(String, ForeignKey("clinicians.clinician_id"), nullable=True)
    facility_id = Column(String, ForeignKey("facilities.facility_id"), nullable=True)
    status = Column(String, nullable=False)
    mfa_enabled = Column(Boolean, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    password_changed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    clinician = relationship("Clinician")
    facility = relationship("Facility")
