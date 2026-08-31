from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class NetworkSecurityGroupBase(BaseModel):
    name: str
    azure_resource_id: str
    subscription: str
    resource_group: str
    region: str
    associated_subnet: Optional[str] = None
    associated_nic: Optional[str] = None
    total_rule_count: int
    last_synced_at: datetime
    notes: Optional[str] = None


class NetworkSecurityGroupCreate(NetworkSecurityGroupBase):
    pass


class NetworkSecurityGroupUpdate(BaseModel):
    name: Optional[str] = None
    azure_resource_id: Optional[str] = None
    subscription: Optional[str] = None
    resource_group: Optional[str] = None
    region: Optional[str] = None
    associated_subnet: Optional[str] = None
    associated_nic: Optional[str] = None
    total_rule_count: Optional[int] = None
    last_synced_at: Optional[datetime] = None
    notes: Optional[str] = None


class NetworkSecurityGroupRead(NetworkSecurityGroupBase):
    model_config = ConfigDict(from_attributes=True)

    network_security_group_id: int
