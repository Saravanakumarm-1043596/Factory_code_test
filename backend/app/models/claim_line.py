"""SQLAlchemy model for ClaimLine, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String

from sqlalchemy.orm import relationship

from app.database import Base


class ClaimLine(Base):
    __tablename__ = "claim_lines"

    claim_line_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.claim_id"), nullable=False)
    line_number = Column(Integer, nullable=False)
    cpt_code = Column(String, nullable=False)
    modifier = Column(String, nullable=True)
    icd10_pointer = Column(String, nullable=True)
    units = Column(Integer, nullable=False)
    billed_amount = Column(Float, nullable=False)
    allowed_amount = Column(Float, nullable=True)
    paid_amount = Column(Float, nullable=True)
    line_status = Column(String, nullable=False)
    denial_reason_code = Column(String, nullable=True)
    lab_test_line_id = Column(Integer, ForeignKey("lab_test_lines.lab_test_line_id"), nullable=True)
    created_at = Column(DateTime, nullable=False)

    claim = relationship("Claim")
    lab_test_line = relationship("LabTestLine")
