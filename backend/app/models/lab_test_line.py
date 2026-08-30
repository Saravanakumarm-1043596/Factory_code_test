"""SQLAlchemy model for LabTestLine, generated from the field spec."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from sqlalchemy.orm import relationship

from app.database import Base


class LabTestLine(Base):
    __tablename__ = "lab_test_lines"

    lab_test_line_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    lab_test_order_id = Column(Integer, ForeignKey("lab_test_orders.lab_test_order_id"), nullable=False)
    cpt_code = Column(String, nullable=False)
    test_name = Column(String, nullable=False)
    loinc_code = Column(String, nullable=True)
    test_category = Column(String, nullable=False)
    result_value = Column(String, nullable=True)
    result_unit = Column(String, nullable=True)
    reference_range = Column(String, nullable=True)
    abnormal_flag = Column(String, nullable=True)
    line_status = Column(String, nullable=False)
    result_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False)

    lab_test_order = relationship("LabTestOrder")
