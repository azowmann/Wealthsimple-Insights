import pandas as pd
import numpy as np
from backend.services.enrichment_service import fetch_ticker_info


def compute_metrics(holdings: list, enrichment_results: list) -> dict:
    """
    Takes holding DB objects and enrichment results, computes
    portfolio-level metrics and returns them as a dictionary.
    """

    # Build a map of ticker -> enrichment data for easy lookup
    enrichment_map = {r["ticker"]: r for r in enrichment_results}

    # --- Portfolio Beta ---
    # Weighted average of each holding's beta, weighted by market value.
    # Holdings with no beta (ETFs) are excluded from the calculation.
    total_value = sum(h.market_value for h in holdings if h.market_value)
    weighted_beta_sum = 0
    beta_value_sum = 0

    for h in holdings:
        enriched = enrichment_map.get(h.ticker)
        if enriched and enriched.get("beta") and h.market_value:
            weight = h.market_value / total_value
            weighted_beta_sum += enriched["beta"] * weight
            beta_value_sum += h.market_value

    portfolio_beta = round(weighted_beta_sum, 4) if beta_value_sum > 0 else None

    # --- Sector Concentration ---
    # Sum of market values grouped by sector, expressed as percentages.
    sector_totals = {}
    for h in holdings:
        enriched = enrichment_map.get(h.ticker)
        sector = enriched.get("sector", "Unknown") if enriched else "Unknown"
        if not sector:
            sector = "Unknown"
        sector_totals[sector] = sector_totals.get(sector, 0) + (h.market_value or 0)

    sector_data = {
        sector: round((value / total_value) * 100, 2)
        for sector, value in sector_totals.items()
    }

    # --- Historical Returns & Sharpe Ratio ---
    # Build a returns dataframe from each holding's price history.
    # Portfolio daily return = weighted average of individual daily returns.
    price_frames = {}

    for h in holdings:
        enriched = enrichment_map.get(h.ticker)
        if not enriched or not enriched.get("history"):
            continue

        history = enriched["history"]
        if len(history) < 30:
            continue

        series = pd.Series(history)
        series.index = pd.to_datetime(series.index)
        series = series.sort_index()
        price_frames[h.ticker] = series

    sharpe_ratio = None
    max_drawdown = None
    correlation = None

    if price_frames:
        # Align all series to common dates
        prices_df = pd.DataFrame(price_frames).dropna()

        if len(prices_df) > 30:
            # Daily returns for each holding
            returns_df = prices_df.pct_change().dropna()

            # Portfolio weights by market value
            weights = {}
            for h in holdings:
                if h.ticker in returns_df.columns and h.market_value:
                    weights[h.ticker] = h.market_value / total_value

            if weights:
                weight_series = pd.Series(weights)
                # Align weights to columns present in returns_df
                aligned_weights = weight_series.reindex(
                    returns_df.columns
                ).fillna(0)
                # Normalize weights to sum to 1
                aligned_weights = aligned_weights / aligned_weights.sum()

                # Portfolio daily returns
                portfolio_returns = returns_df.dot(aligned_weights)

                # Sharpe ratio — annualized (252 trading days)
                # Assumes risk-free rate of ~4% annually (~0.000158 daily)
                risk_free_daily = 0.04 / 252
                excess_returns = portfolio_returns - risk_free_daily
                sharpe = (
                    excess_returns.mean() / excess_returns.std()
                ) * np.sqrt(252)
                sharpe_ratio = round(float(sharpe), 4)

                # Max drawdown — worst peak to trough loss
                cumulative = (1 + portfolio_returns).cumprod()
                rolling_max = cumulative.cummax()
                drawdown = (cumulative - rolling_max) / rolling_max
                max_drawdown = round(float(drawdown.min()) * 100, 2)

            # Correlation matrix between individual holdings
            if len(returns_df.columns) > 1:
                corr_matrix = returns_df.corr().round(4)
                correlation = corr_matrix.to_dict()

    return {
        "portfolio_beta": portfolio_beta,
        "sector_data": sector_data,
        "sharpe_ratio": sharpe_ratio,
        "max_drawdown": max_drawdown,
        "correlation": correlation
    }