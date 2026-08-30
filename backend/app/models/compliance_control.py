"""SQLAlchemy model for ComplianceControl, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Date, DateTime, Integer, String, Text

from app.database import Base


class ComplianceControl(Base):
    __tablename__ = "compliance_controls"

    compliance_control_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    control_framework = Column(String, nullable=False)
    control_identifier = Column(String, nullable=False)
    control_name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    control_category = Column(String, nullable=False)
    status = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)
    last_assessment_date = Column(Date, nullable=True)
    next_assessment_date = Column(Date, nullable=True)
    responsible_party = Column(String, nullable=False)
    evidence_document = Column(String, nullable=True)
    remediation_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
