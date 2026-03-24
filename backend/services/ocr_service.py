import anthropic
import base64
import json

client = anthropic.Anthropic()


def process_screenshot(image_bytes: bytes) -> list[dict]:
    """
    Sends the screenshot to Claude vision and gets back a structured
    list of holdings. Replaces the Tesseract + regex pipeline entirely.
    """

    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    # Detect image type from magic bytes
    if image_bytes[:8] == b'\x89PNG\r\n\x1a\n':
        media_type = "image/png"
    elif image_bytes[:2] == b'\xff\xd8':
        media_type = "image/jpeg"
    else:
        media_type = "image/png"  # safe default

    prompt = """This is a screenshot of a Wealthsimple holdings page. Extract every holding visible and return ONLY a JSON array — no markdown, no explanation.

Each object in the array must have exactly these fields:
{
  "ticker": "<ticker symbol, e.g. VFV, UBER, CCO>",
  "shares": <number or null>,
  "market_value": <number — the dollar amount shown, e.g. 4664.41>,
  "currency": "<CAD or USD>",
  "gain_loss_pct": <signed number, e.g. 21.54 for +21.54% or -8.40 for -8.40%, or null if not shown>
}

Rules:
- ticker: uppercase letters only, no suffixes like .TO
- shares: extract the number before "shares", e.g. 28.3086
- market_value: the main dollar value shown (not the gain/loss dollar amount)
- currency: read directly from the label (CAD or USD)
- gain_loss_pct: positive for gains, negative for losses
- Include every holding you can see, even partial ones at the bottom
- Return ONLY the JSON array, nothing else"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": prompt,
                    }
                ],
            }
        ],
    )

    raw = message.content[0].text.strip()

    print("--- CLAUDE VISION RAW ---")
    print(raw)
    print("-------------------------")

    # Strip accidental markdown fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    holdings = json.loads(raw)

    print(f"--- EXTRACTED {len(holdings)} HOLDINGS ---")
    for h in holdings:
        print(h)
    print("----------------------------------")

    return holdings