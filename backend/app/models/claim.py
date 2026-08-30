"""SQLAlchemy model for Claim, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class Claim(Base):
    __tablename__ = "claims"

    claim_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    claim_number = Column(String, nullable=False)
    lab_test_order_id = Column(Integer, ForeignKey("lab_test_orders.lab_test_order_id"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.member_id"), nullable=False)
    rendering_provider_id = Column(Integer, ForeignKey("providers.provider_id"), nullable=False)
    line_of_business_id = Column(Integer, ForeignKey("line_of_businesses.line_of_business_id"), nullable=False)
    source_system = Column(String, nullable=False)
    claim_type = Column(String, nullable=False)
    claim_status = Column(String, nullable=False)
    total_billed_amount = Column(Float, nullable=False)
    total_allowed_amount = Column(Float, nullable=True)
    total_paid_amount = Column(Float, nullable=True)
    member_responsibility = Column(Float, nullable=True)
    service_date = Column(Date, nullable=False)
    submitted_date = Column(DateTime, nullable=False)
    adjudicated_date = Column(DateTime, nullable=True)
    has_error = Column(Boolean, nullable=False)
    denial_reason_code = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    lab_test_order = relationship("LabTestOrder")
    member = relationship("Member")
    rendering_provider = relationship("Provider")
    line_of_business = relationship("LineOfBusiness")
