from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime
import uuid
    
class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    filename = Column(Text, nullable=False)
    status = Column(String, default="processing")  # processing / complete / failed

    # Relationships tell SQLAlchemy that one portfolio owns many holdings
    # and one set of metrics. cascade="all, delete" means if you delete a
    # portfolio, its holdings and metrics are automatically deleted too.
    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete")
    metrics = relationship("Metrics", back_populates="portfolio", cascade="all, delete", uselist=False)


class Holding(Base):
    __tablename__ = "holdings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id"), nullable=False)
    ticker = Column(String, nullable=False)
    shares = Column(Float)
    market_value = Column(Float)
    avg_buy_price = Column(Float)
    gain_loss_pct = Column(Float)

    # Enriched fields — these are null initially, filled after yfinance call
    sector = Column(String, nullable=True)
    beta = Column(Float, nullable=True)
    dividend_yield = Column(Float, nullable=True)

    portfolio = relationship("Portfolio", back_populates="holdings")


class Metrics(Base):
    __tablename__ = "metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id"), nullable=False)
    sharpe_ratio = Column(Float, nullable=True)
    portfolio_beta = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)

    # JSONB columns store complex nested data natively in PostgreSQL.
    # sector_data will look like: {"Technology": 45.2, "Healthcare": 30.1}
    # correlation will look like: {"AAPL": {"MSFT": 0.82, "GOOG": 0.71}, ...}
    sector_data = Column(JSONB, nullable=True)
    correlation = Column(JSONB, nullable=True)
    computed_at = Column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="metrics")