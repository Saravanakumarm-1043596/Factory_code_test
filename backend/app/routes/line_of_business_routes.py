"""REST routes for LineOfBusiness, mounted at /api/lineofbusinesses."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from modules.orchestrator.fullstack.schemas.line_of_business import LineOfBusinessCreate, LineOfBusinessRead, LineOfBusinessUpdate
from app.services import line_of_business_service as service

router = APIRouter(prefix="/api/lineofbusinesses", tags=["LineOfBusiness"])


@router.get("", response_model=list[LineOfBusinessRead])
def list_lineOfBusiness(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return service.list_all(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=LineOfBusinessRead)
def get_lineOfBusiness(item_id: int, db: Session = Depends(get_db)):
    obj = service.get_by_id(db, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Line Of Business not found")
    return obj


@router.post("", response_model=LineOfBusinessRead, status_code=status.HTTP_201_CREATED)
def create_lineOfBusiness(payload: LineOfBusinessCreate, db: Session = Depends(get_db)):
    return service.create(db, payload.model_dump())


@router.put("/{item_id}", response_model=LineOfBusinessRead)
def update_lineOfBusiness(item_id: int, payload: LineOfBusinessUpdate, db: Session = Depends(get_db)):
    obj = service.update(db, item_id, payload.model_dump(exclude_unset=True))
    if obj is None:
        raise HTTPException(status_code=404, detail="Line Of Business not found")
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lineOfBusiness(item_id: int, db: Session = Depends(get_db)):
    ok = service.delete(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Line Of Business not found")
    return None
