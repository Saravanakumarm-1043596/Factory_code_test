"""SQLAlchemy model for Member, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String

from sqlalchemy.orm import relationship

from app.database import Base


class Member(Base):
    __tablename__ = "members"

    member_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    facets_member_id = Column(String, nullable=False)
    epic_mrn = Column(String, nullable=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    line_of_business_id = Column(Integer, ForeignKey("line_of_businesses.line_of_business_id"), nullable=False)
    plan_type = Column(String, nullable=False)
    coverage_start_date = Column(Date, nullable=False)
    coverage_end_date = Column(Date, nullable=True)
    member_status = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

    line_of_business = relationship("LineOfBusiness")
