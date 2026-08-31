"""REST routes for AppUser, mounted at /api/appusers."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.app_user import AppUserCreate, AppUserRead, AppUserUpdate
from app.services import app_user_service as service

router = APIRouter(prefix="/api/appusers", tags=["AppUser"])


@router.get("", response_model=list[AppUserRead])
def list_appUser(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=AppUserRead)
def get_appUser(item_id: str, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="App User not found")
    return obj


@router.post("", response_model=AppUserRead, status_code=status.HTTP_201_CREATED)
def create_appUser(payload: AppUserCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=AppUserRead)
def update_appUser(item_id: str, payload: AppUserUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="App User not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appUser(item_id: str, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="App User not found")
    return None
