# Simple in-memory cache for ticker enrichment data.
# Keyed by resolved ticker symbol (e.g. "VFV.TO", "UBER").
# Lives for the duration of the server process.

_cache: dict = {}


def get_cached(ticker: str) -> dict | None:
    return _cache.get(ticker)

def set_cached(ticker: str, data: dict) -> None:
    _cache[ticker] = data

def clear_cache() -> None:
    _cache.clear()