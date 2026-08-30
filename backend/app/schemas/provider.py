from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ProviderBase(BaseModel):
    npi: str
    provider_name: str
    provider_type: Literal['Ordering Physician', 'Laboratory', 'Reference Lab', 'Hospital Lab']
    tax_id: str
    clia_number: Optional[str] = None
    network_status: Literal['In-Network', 'Out-of-Network', 'Pending']
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: bool
    created_at: datetime


class ProviderCreate(ProviderBase):
    pass


class ProviderUpdate(BaseModel):
    npi: Optional[str] = None
    provider_name: Optional[str] = None
    provider_type: Optional[Literal['Ordering Physician', 'Laboratory', 'Reference Lab', 'Hospital Lab']] = None
    tax_id: Optional[str] = None
    clia_number: Optional[str] = None
    network_status: Optional[Literal['In-Network', 'Out-of-Network', 'Pending']] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None
    created_at: Optional[datetime] = None


class ProviderRead(ProviderBase):
    model_config = ConfigDict(from_attributes=True)

    provider_id: int
