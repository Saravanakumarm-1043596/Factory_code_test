"""REST routes for ProtectedSystem, mounted at /api/protectedsystems."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.protected_system import ProtectedSystemCreate, ProtectedSystemRead, ProtectedSystemUpdate
from app.services import protected_system_service as service

router = APIRouter(prefix="/api/protectedsystems", tags=["ProtectedSystem"])


@router.get("", response_model=list[ProtectedSystemRead])
def list_protectedSystem(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=ProtectedSystemRead)
def get_protectedSystem(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Protected System not found")
    return obj


@router.post("", response_model=ProtectedSystemRead, status_code=status.HTTP_201_CREATED)
def create_protectedSystem(payload: ProtectedSystemCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=ProtectedSystemRead)
def update_protectedSystem(item_id: int, payload: ProtectedSystemUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Protected System not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_protectedSystem(item_id: int, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Protected System not found")
    return None
