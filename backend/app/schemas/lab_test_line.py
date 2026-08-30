from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class LabTestLineBase(BaseModel):
    lab_test_order_id: int
    cpt_code: str
    test_name: str
    loinc_code: Optional[str] = None
    test_category: Literal['Chemistry', 'Hematology', 'Microbiology', 'Pathology', 'Genetic', 'Immunology', 'Toxicology', 'Other']
    result_value: Optional[str] = None
    result_unit: Optional[str] = None
    reference_range: Optional[str] = None
    abnormal_flag: Optional[Literal['Normal', 'Low', 'High', 'Critical Low', 'Critical High', 'Abnormal']] = None
    line_status: Literal['Pending', 'Resulted', 'Cancelled']
    result_date: Optional[datetime] = None
    created_at: datetime


class LabTestLineCreate(LabTestLineBase):
    pass


class LabTestLineUpdate(BaseModel):
    lab_test_order_id: Optional[int] = None
    cpt_code: Optional[str] = None
    test_name: Optional[str] = None
    loinc_code: Optional[str] = None
    test_category: Optional[Literal['Chemistry', 'Hematology', 'Microbiology', 'Pathology', 'Genetic', 'Immunology', 'Toxicology', 'Other']] = None
    result_value: Optional[str] = None
    result_unit: Optional[str] = None
    reference_range: Optional[str] = None
    abnormal_flag: Optional[Literal['Normal', 'Low', 'High', 'Critical Low', 'Critical High', 'Abnormal']] = None
    line_status: Optional[Literal['Pending', 'Resulted', 'Cancelled']] = None
    result_date: Optional[datetime] = None
    created_at: Optional[datetime] = None


class LabTestLineRead(LabTestLineBase):
    model_config = ConfigDict(from_attributes=True)

    lab_test_line_id: int
