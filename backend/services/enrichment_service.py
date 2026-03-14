import yfinance as yf
from backend.cache.ticker_cache import get_cached, set_cached


# Canadian tickers on Wealthsimple use a ".TO" suffix on Yahoo Finance
# e.g. VFV -> VFV.TO, CCO -> CCO.TO
# USD-denominated tickers like UBER don't need the suffix
KNOWN_USD_TICKERS = {"UBER", "AAPL", "TSLA", "MSFT", "AMZN", "GOOG", "GOOGL", "META", "NVDA", "AMD"}

def resolve_ticker(ticker: str, currency: str) -> str:
    """
    Determine the correct Yahoo Finance ticker symbol.
    CAD holdings get .TO suffix, USD holdings stay as-is.
    """
    if currency == "USD" or ticker in KNOWN_USD_TICKERS:
        return ticker
    return f"{ticker}.TO"


def fetch_ticker_info(ticker: str, currency: str) -> dict:
    """
    Fetch enrichment data for a single ticker from Yahoo Finance.
    Checks cache first to avoid redundant API calls.
    Returns a dict with sector, beta, dividend_yield, and history.
    """
    resolved = resolve_ticker(ticker, currency)

    # Check cache first
    cached = get_cached(resolved)
    if cached:
        print(f"[CACHE HIT] {resolved}")
        return cached

    print(f"[FETCHING] {resolved}")

    try:
        asset = yf.Ticker(resolved)
        info = asset.info

        # Pull 2 years of daily closing prices for metrics calculations
        history = asset.history(period="2y")["Close"]
        history_dict = {
            str(date.date()): round(price, 4)
            for date, price in history.items()
        }

        enriched = {
            "resolved_ticker": resolved,
            "sector": info.get("sector") or info.get("quoteType", "Unknown"),
            "beta": info.get("beta"),
            "dividend_yield": info.get("dividendYield"),
            "long_name": info.get("longName") or info.get("shortName"),
            "history": history_dict
        }

    except Exception as e:
        print(f"[ERROR] Could not fetch {resolved}: {e}")
        enriched = {
            "resolved_ticker": resolved,
            "sector": "Unknown",
            "beta": None,
            "dividend_yield": None,
            "long_name": ticker,
            "history": {}
        }

    set_cached(resolved, enriched)
    return enriched


def enrich_holdings(holdings: list) -> list:
    """
    Takes a list of Holding DB objects, enriches each one with
    yfinance data, and returns a list of enrichment result dicts
    keyed by holding id.
    """
    results = []

    for holding in holdings:
        ticker = holding.ticker
        currency = holding.currency if holding.currency else "CAD"

        enrichment = fetch_ticker_info(ticker, currency)

        results.append({
            "holding_id": holding.id,
            "ticker": ticker,
            "resolved_ticker": enrichment["resolved_ticker"],
            "sector": enrichment["sector"],
            "beta": enrichment["beta"],
            "dividend_yield": enrichment["dividend_yield"],
            "long_name": enrichment["long_name"],
            "history": enrichment["history"]
        })

    return results