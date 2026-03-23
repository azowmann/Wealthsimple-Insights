from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.portfolio import Portfolio, Holding, Metrics
from backend.services.ocr_service import process_screenshot
from backend.services.enrichment_service import enrich_holdings
from backend.services.metrics_service import compute_metrics
from backend.services.ai_service import generate_portfolio_analysis
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_portfolio(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="Only PNG and JPG files are supported.")

    image_bytes = await file.read()

    try:
        parsed_holdings = process_screenshot(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

    if not parsed_holdings:
        raise HTTPException(status_code=422, detail="No holdings could be extracted.")

    # Create portfolio record
    portfolio = Portfolio(
        id=uuid.uuid4(),
        filename=file.filename,
        status="processing"
    )
    db.add(portfolio)
    db.flush()

    # Insert raw holdings
    holding_objects = []
    for h in parsed_holdings:
        holding = Holding(
            id=uuid.uuid4(),
            portfolio_id=portfolio.id,
            ticker=h.get("ticker"),
            shares=h.get("shares"),
            market_value=h.get("market_value"),
            avg_buy_price=None,
            gain_loss_pct=h.get("gain_loss_pct"),
            currency=h.get("currency", "CAD")
        )
        db.add(holding)
        holding_objects.append(holding)

    db.flush()

    # Run enrichment
    enrichment_results = enrich_holdings(holding_objects)

    # Update holdings with enriched data
    enrichment_map = {r["holding_id"]: r for r in enrichment_results}
    for holding in holding_objects:
        enriched = enrichment_map.get(holding.id)
        if enriched:
            holding.sector = enriched["sector"]
            holding.beta = enriched["beta"]
            holding.dividend_yield = enriched["dividend_yield"]

    db.flush()

    # Compute quantitative metrics
    metrics_data = compute_metrics(holding_objects, enrichment_results)

    # Generate AI analysis — runs after metrics so Claude has full context.
    # Wrapped in try/except so a Claude API hiccup never fails the whole upload.
    try:
        ai_analysis = generate_portfolio_analysis(holding_objects, metrics_data)
    except Exception as e:
        print(f"[AI SERVICE ERROR] {e}")
        ai_analysis = None

    metrics = Metrics(
        id=uuid.uuid4(),
        portfolio_id=portfolio.id,
        sharpe_ratio=metrics_data["sharpe_ratio"],
        portfolio_beta=metrics_data["portfolio_beta"],
        max_drawdown=metrics_data["max_drawdown"],
        sector_data=metrics_data["sector_data"],
        correlation=metrics_data["correlation"],
        ai_analysis=ai_analysis,
    )
    db.add(metrics)

    portfolio.status = "complete"
    db.commit()
    db.refresh(portfolio)

    return {
        "portfolio_id": str(portfolio.id),
        "status": portfolio.status,
        "holdings_extracted": len(parsed_holdings),
        "metrics": metrics_data,
        "ai_analysis": ai_analysis,
        "holdings": [
            {
                "ticker": r["ticker"],
                "sector": r["sector"],
                "beta": r["beta"],
                "long_name": r["long_name"],
            }
            for r in enrichment_results
        ]
    }