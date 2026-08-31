"""SQLAlchemy model for ProtectedSystem, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Boolean, Date, Integer, String, Text

from app.database import Base


class ProtectedSystem(Base):
    __tablename__ = "protected_systems"

    protected_system_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String, nullable=False)
    system_type = Column(String, nullable=False)
    environment = Column(String, nullable=False)
    contains_phi = Column(Boolean, nullable=False)
    data_classification = Column(String, nullable=False)
    owner = Column(String, nullable=False)
    ip_range = Column(String, nullable=True)
    compliance_scope = Column(String, nullable=False)
    last_assessment_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
