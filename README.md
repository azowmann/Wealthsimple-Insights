# Wealthsimple Portfolio Analyzer

A full-stack portfolio analytics web app that extracts holdings data from Wealthsimple screenshots using computer vision, enriches it with live market data, and computes institutional-grade portfolio metrics — all presented in a clean, Wealthsimple-inspired dashboard.

---

## What It Does

Wealthsimple shows you your balance and basic gains. This app shows you what your portfolio actually means:

- **Sharpe ratio** — are your returns worth the risk you're taking?
- **Portfolio beta** — how aggressively does your portfolio move vs. the market?
- **Max drawdown** — what's the worst historical loss you'd have experienced?
- **Sector concentration** — are you actually diversified, or just holding 5 tech stocks?
- **Correlation matrix** — which of your holdings move together, and which are truly independent?

---

## Tech Stack

| Layer | Technology |
|---|---|
| API Server | FastAPI (Python) |
| OCR Pipeline | OpenCV + Tesseract |
| Market Data | yfinance |
| Metrics Engine | pandas, numpy |
| Database ORM | SQLAlchemy |
| Database | PostgreSQL (Supabase) |
| Frontend | React + Recharts |
| Containerization | Docker + Docker Compose |

---

## Architecture

```
[ User uploads screenshot ]
        ↓
[ React Frontend ]
        ↓  POST /portfolio/upload
[ FastAPI Backend ]
        ↓
[ OpenCV + Tesseract OCR ]  →  [ PostgreSQL (Supabase) ]
        ↓
[ Enrichment Service (yfinance) ]
        ↓
[ Metrics Engine (pandas/numpy) ]
        ↓
[ FastAPI returns JSON ]
        ↓
[ React Dashboard ]
```

---

## Project Structure

```
wealthsimple-analyzer/
│
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── database.py                # DB connection & session management
│   │
│   ├── routers/
│   │   ├── portfolio.py           # POST /portfolio/upload
│   │   ├── holdings.py            # GET /holdings/{portfolio_id}
│   │   └── metrics.py             # GET /metrics/{portfolio_id}
│   │
│   ├── services/
│   │   ├── ocr_service.py         # OpenCV + Tesseract pipeline
│   │   ├── enrichment_service.py  # yfinance API integration
│   │   └── metrics_service.py     # Sharpe, beta, correlation math
│   │
│   ├── models/
│   │   ├── portfolio.py           # SQLAlchemy DB models
│   │   └── schemas.py             # Pydantic request/response schemas
│   │
│   └── cache/
│       └── ticker_cache.py        # In-memory cache for enriched data
│
├── frontend/
│   └── src/
│       ├── api/client.js          # Axios API calls
│       ├── components/            # MetricsCard, SectorChart, HoldingsTable, CorrelationHeatmap
│       └── pages/                 # Home, Dashboard
│
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── requirements.txt
└── .env
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A [Supabase](https://supabase.com) account (free tier)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/wealthsimple-analyzer.git
cd wealthsimple-analyzer
```

### 2. Set up environment variables

Create a `.env` file at the project root:

```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

Get your connection string from Supabase → **Settings** → **Database** → **Connection string** → **Session pooler**.

### 3. Run with Docker

```bash
docker-compose up --build
```

That's it. Both services start automatically:

- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:8000
- **API Docs** → http://localhost:8000/docs

### 4. Use the app

1. Open your Wealthsimple app and navigate to the Holdings page
2. Take a screenshot
3. Upload it at http://localhost:5173
4. Your portfolio dashboard loads automatically

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/portfolio/upload` | Upload a holdings screenshot |
| `GET` | `/holdings/{portfolio_id}` | Get enriched holdings for a portfolio |
| `GET` | `/metrics/{portfolio_id}` | Get computed portfolio metrics |

Interactive docs available at `/docs` when the server is running.

---

## Database Schema

```
portfolios          holdings                metrics
──────────          ────────                ───────
id (UUID)           id (UUID)               id (UUID)
filename            portfolio_id (FK)        portfolio_id (FK)
status              ticker                  sharpe_ratio
uploaded_at         shares                  portfolio_beta
                    market_value            max_drawdown
                    currency                sector_data (JSONB)
                    gain_loss_pct           correlation (JSONB)
                    sector                  computed_at
                    beta
                    dividend_yield
```

---

## How the OCR Pipeline Works

1. **Preprocessing** — OpenCV converts the screenshot to grayscale, crops out stock icons (which interfere with text recognition), upscales 3x, applies Gaussian blur, and uses adaptive thresholding to produce a clean black-and-white image
2. **Text extraction** — Tesseract OCR reads the preprocessed image with PSM 6 (uniform block of text)
3. **Cleaning** — Common misreads are corrected (e.g. `=` → `-` for negative values, decimal normalization)
4. **Parsing** — Regex patterns extract ticker symbols, share counts, market values, currencies, and gain/loss figures into structured dictionaries

---

## Metrics Explained

**Sharpe Ratio** — annualized return divided by annualized volatility, adjusted for a 4% risk-free rate. A ratio above 1.0 indicates strong risk-adjusted performance.

**Portfolio Beta** — weighted average of individual holding betas by market value. Beta of 1.0 means the portfolio moves in line with the market; above 1.0 is more aggressive, below 1.0 is more defensive.

**Max Drawdown** — the worst peak-to-trough percentage loss over the 2-year historical window. A gut-check metric for downside risk.

**Sector Concentration** — percentage of total portfolio value allocated to each sector, sourced from Yahoo Finance metadata.

**Correlation Matrix** — pairwise Pearson correlation coefficients between holding daily returns over 2 years. Values near 1.0 indicate holdings that move together; values near 0 indicate genuine diversification.

---

## Notes

- Only PNG and JPG screenshots are supported
- Canadian tickers (e.g. VFV, XFN) are automatically resolved to their `.TO` Yahoo Finance equivalents
- ETFs do not have beta values in Yahoo Finance — these appear as `—` in the dashboard
- OCR accuracy depends on screenshot quality; clean, high-contrast screenshots from the mobile app work best
