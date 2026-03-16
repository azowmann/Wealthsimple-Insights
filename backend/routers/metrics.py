from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.portfolio import Metrics
from uuid import UUID

router = APIRouter()


@router.get("/{portfolio_id}")
def get_metrics(portfolio_id: UUID, db: Session = Depends(get_db)):
    metrics = db.query(Metrics).filter(
        Metrics.portfolio_id == portfolio_id
    ).first()

    if not metrics:
        raise HTTPException(status_code=404, detail="No metrics found for this portfolio.")

    return {
        "portfolio_beta": metrics.portfolio_beta,
        "sharpe_ratio": metrics.sharpe_ratio,
        "max_drawdown": metrics.max_drawdown,
        "sector_data": metrics.sector_data,
        "correlation": metrics.correlation,
        "computed_at": metrics.computed_at,
    }