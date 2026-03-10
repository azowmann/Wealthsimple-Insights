from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from uuid import UUID

router = APIRouter()

@router.get("/{portfolio_id}")
def get_metrics(portfolio_id: UUID, db: Session = Depends(get_db)):
    # Phase 4 — will compute and return portfolio metrics
    return {"message": "Metrics endpoint ready", "portfolio_id": str(portfolio_id)}