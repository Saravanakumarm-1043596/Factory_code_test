"""SQLAlchemy model for ClaimError, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class ClaimError(Base):
    __tablename__ = "claim_errors"

    claim_error_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.claim_id"), nullable=False)
    claim_line_id = Column(Integer, ForeignKey("claim_lines.claim_line_id"), nullable=True)
    error_category = Column(String, nullable=False)
    error_severity = Column(String, nullable=False)
    error_description = Column(Text, nullable=False)
    source_system_origin = Column(String, nullable=False)
    resolution_status = Column(String, nullable=False)
    assigned_to = Column(String, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    detected_date = Column(DateTime, nullable=False)
    resolved_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False)

    claim = relationship("Claim")
    claim_line = relationship("ClaimLine")
