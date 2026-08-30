"""REST routes for ClaimError, mounted at /api/claimerrors."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.claim_error import ClaimErrorCreate, ClaimErrorRead, ClaimErrorUpdate
from app.services import claim_error_service as service

router = APIRouter(prefix="/api/claimerrors", tags=["ClaimError"])


@router.get("", response_model=list[ClaimErrorRead])
def list_claimError(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=ClaimErrorRead)
def get_claimError(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Claim Error not found")
    return obj


@router.post("", response_model=ClaimErrorRead, status_code=status.HTTP_201_CREATED)
def create_claimError(payload: ClaimErrorCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=ClaimErrorRead)
def update_claimError(item_id: int, payload: ClaimErrorUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Claim Error not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_claimError(item_id: int, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Claim Error not found")
    return None
