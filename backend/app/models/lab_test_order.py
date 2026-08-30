"""SQLAlchemy model for LabTestOrder, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Boolean, DateTime, ForeignKey, Integer, String, Text

from sqlalchemy.orm import relationship

from app.database import Base


class LabTestOrder(Base):
    __tablename__ = "lab_test_orders"

    lab_test_order_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    order_number = Column(String, nullable=False)
    member_id = Column(Integer, ForeignKey("members.member_id"), nullable=False)
    ordering_provider_id = Column(Integer, ForeignKey("providers.provider_id"), nullable=False)
    performing_lab_id = Column(Integer, ForeignKey("providers.provider_id"), nullable=False)
    line_of_business_id = Column(Integer, ForeignKey("line_of_businesses.line_of_business_id"), nullable=False)
    source_system = Column(String, nullable=False)
    order_status = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    clinical_indication = Column(Text, nullable=True)
    icd10_codes = Column(String, nullable=True)
    order_date = Column(DateTime, nullable=False)
    specimen_collection_date = Column(DateTime, nullable=True)
    result_date = Column(DateTime, nullable=True)
    prior_auth_required = Column(Boolean, nullable=False)
    prior_auth_number = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    member = relationship("Member")
    ordering_provider = relationship("Provider")
    performing_lab = relationship("Provider")
    line_of_business = relationship("LineOfBusiness")
