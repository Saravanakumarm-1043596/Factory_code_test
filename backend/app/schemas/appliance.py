from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

class ApplianceBase(BaseModel):
    name: str
    appliance_type: Literal['Palo Alto', 'Fortinet', 'Azure Firewall', 'F5', 'Other']
    ip_address: str
    hostname: Optional[str] = None
    environment: Literal['Production', 'Staging', 'Development', 'DR']
    firmware_version: Optional[str] = None
    total_rule_count: int
    last_synced_at: datetime
    notes: Optional[str] = None


class ApplianceCreate(ApplianceBase):
    pass


class ApplianceUpdate(BaseModel):
    name: Optional[str] = None
    appliance_type: Optional[Literal['Palo Alto', 'Fortinet', 'Azure Firewall', 'F5', 'Other']] = None
    ip_address: Optional[str] = None
    hostname: Optional[str] = None
    environment: Optional[Literal['Production', 'Staging', 'Development', 'DR']] = None
    firmware_version: Optional[str] = None
    total_rule_count: Optional[int] = None
    last_synced_at: Optional[datetime] = None
    notes: Optional[str] = None


class ApplianceRead(ApplianceBase):
    model_config = ConfigDict(from_attributes=True)

    appliance_id: int
