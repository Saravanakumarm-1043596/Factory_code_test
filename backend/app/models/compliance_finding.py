"""SQLAlchemy model for ComplianceFinding, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class ComplianceFinding(Base):
    __tablename__ = "compliance_findings"

    compliance_finding_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    compliance_control_id = Column(Integer, ForeignKey("compliance_controls.compliance_control_id"), nullable=False)
    finding_type = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    affected_system = Column(String, nullable=False)
    affected_line_of_business_id = Column(Integer, ForeignKey("line_of_businesses.line_of_business_id"), nullable=True)
    status = Column(String, nullable=False)
    assigned_to = Column(String, nullable=True)
    remediation_plan = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    evidence_attachment = Column(String, nullable=True)
    found_date = Column(DateTime, nullable=False)
    resolved_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False)

    compliance_control = relationship("ComplianceControl")
    affected_line_of_business = relationship("LineOfBusiness")
