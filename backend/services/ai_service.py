import anthropic
import json

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env


def generate_portfolio_analysis(holdings: list, metrics: dict) -> dict:
    """
    Takes enriched holdings and computed metrics, calls Claude to produce
    a structured portfolio health summary and risk recommendations.

    Returns a dict with:
      - health_score: int 1-10
      - health_summary: str (2-3 sentence overview)
      - strengths: list[str]
      - risk_flags: list[str]
      - recommendations: list[str]
    """

    # Build a compact, structured prompt payload so Claude has full context
    holdings_summary = [
        {
            "ticker": h.ticker,
            "market_value": h.market_value,
            "currency": h.currency,
            "gain_loss_pct": h.gain_loss_pct,
            "sector": h.sector,
            "beta": h.beta,
            "dividend_yield": h.dividend_yield,
        }
        for h in holdings
    ]

    total_value = sum(h.market_value for h in holdings if h.market_value)

    prompt = f"""You are a professional portfolio analyst. Analyze the following portfolio and return a JSON object.

PORTFOLIO OVERVIEW
Total value: ${total_value:,.2f}
Number of holdings: {len(holdings)}

HOLDINGS:
{json.dumps(holdings_summary, indent=2)}

COMPUTED METRICS:
- Sharpe Ratio: {metrics.get("sharpe_ratio")}
- Portfolio Beta: {metrics.get("portfolio_beta")}
- Max Drawdown: {metrics.get("max_drawdown")}%
- Sector Allocation: {json.dumps(metrics.get("sector_data", {}))}

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{{
  "health_score": <integer 1-10>,
  "health_summary": "<2-3 sentence plain English summary of overall portfolio health>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "risk_flags": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<actionable recommendation 3>"]
}}

Guidelines:
- health_score: 1=very poor, 5=average, 10=excellent. Base it on diversification, risk-adjusted return (Sharpe), beta, and drawdown.
- strengths: genuine positives in the portfolio (diversification, low beta, positive Sharpe, etc.)
- risk_flags: concrete risks (concentration, high beta, negative Sharpe, large drawdown, single-sector overweight, etc.)
- recommendations: specific, actionable steps (not generic advice). Reference actual tickers or sectors where relevant.
- Be direct and data-driven. Avoid filler phrases."""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()

    # Strip any accidental markdown fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback — return a safe default rather than crashing the upload
        return {
            "health_score": None,
            "health_summary": "Analysis could not be generated at this time.",
            "strengths": [],
            "risk_flags": [],
            "recommendations": [],
        }