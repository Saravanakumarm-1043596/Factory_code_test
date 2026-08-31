"""REST routes for NetworkSecurityGroup, mounted at /api/networksecuritygroups."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.network_security_group import NetworkSecurityGroupCreate, NetworkSecurityGroupRead, NetworkSecurityGroupUpdate
from app.services import network_security_group_service as service

router = APIRouter(prefix="/api/networksecuritygroups", tags=["NetworkSecurityGroup"])


@router.get("", response_model=list[NetworkSecurityGroupRead])
def list_networkSecurityGroup(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=NetworkSecurityGroupRead)
def get_networkSecurityGroup(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Network Security Group not found")
    return obj


@router.post("", response_model=NetworkSecurityGroupRead, status_code=status.HTTP_201_CREATED)
def create_networkSecurityGroup(payload: NetworkSecurityGroupCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=NetworkSecurityGroupRead)
def update_networkSecurityGroup(item_id: int, payload: NetworkSecurityGroupUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Network Security Group not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_networkSecurityGroup(item_id: int, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Network Security Group not found")
    return None
