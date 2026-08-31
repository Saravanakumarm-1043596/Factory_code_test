"""SQLAlchemy model for Facility, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, String

from app.database import Base


class Facility(Base):
    __tablename__ = "facilities"

    facility_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    ehr_source_system = Column(String, nullable=False)
    facility_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)
