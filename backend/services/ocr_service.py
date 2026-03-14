import cv2
import pytesseract
import numpy as np
import re

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    h, w = img.shape[:2]
    img = img[:, int(w * 0.12):]

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    scaled = cv2.resize(gray, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    blurred = cv2.GaussianBlur(scaled, (3, 3), 0)

    thresh = cv2.adaptiveThreshold(
        blurred, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11, 2
    )

    cv2.imwrite("debug_processed.png", thresh)

    return thresh

def clean_text(raw_text: str) -> str:
    text = re.sub(r'(?<!\w)S\$', '$', raw_text)
    text = re.sub(r'(?<=[+\-])S', '$', text)
    text = re.sub(r'=\$', '-$', text)

    # Fix dropped decimals in dollar amounts — e.g. "$6712" when it should be "$67.12"
    # Pattern: dollar amount with no decimal followed by exactly 2 digits at end of number
    # This specifically catches 4-digit amounts that should be 2+2
    def fix_decimal(match):
        amount = match.group(1)
        # If 4 digits with no decimal, insert decimal after first 2
        if re.match(r'^\d{4}$', amount):
            return f'${amount[:2]}.{amount[2:]}'
        return match.group(0)

    text = re.sub(r'\$([\d]+)(?=\s)', fix_decimal, text)

    text = text.replace('—', '-').replace('–', '-')

    lines = [line.upper() for line in text.split('\n')]
    return '\n'.join(lines)


def extract_text(image_bytes: bytes) -> str:
    processed = preprocess_image(image_bytes)
    custom_config = r"--oem 3 --psm 6"
    raw_text = pytesseract.image_to_string(processed, config=custom_config)
    return raw_text


def parse_holdings(raw_text: str) -> list[dict]:
    """
    Parse cleaned OCR text into structured holdings.
    Strategy: scan every line for each data type independently
    rather than assuming a fixed line order.
    """
    cleaned = clean_text(raw_text)
    lines = [line.strip() for line in cleaned.split('\n') if line.strip()]

    print("--- CLEANED LINES ---")
    for line in lines:
        print(repr(line))
    print("---------------------")

    # Known tickers we expect — used as an anchor for parsing
    # This is a fallback safety net alongside the regex
    holdings = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # Match a ticker — 2 to 5 uppercase letters, alone on a line
        # OR at the start of a line followed by a space and dollar amount
        ticker_match = re.match(r'^([A-Z]{2,5})(?:\s|$)', line)

        if ticker_match:
            ticker = ticker_match.group(1)

            # Skip non-ticker words that happen to be all caps
            skip_words = {"CAD", "USD", "ETF", "ETFS", "SORT", "STOCKS", "HOLDINGS", "TOTAL"}
            if ticker in skip_words:
                i += 1
                continue

            holding = {"ticker": ticker}

            # Search this line and the next 4 lines for associated data
            search_lines = lines[i:min(i + 5, len(lines))]
            combined = ' '.join(search_lines)

            # Shares — e.g. "28.3086 SHARES" or "10 SHARES"
            shares_match = re.search(r'([\d]+\.?\d*)\s+SHA', combined)
            if shares_match:
                holding["shares"] = float(shares_match.group(1).replace(',', ''))

            # Market value — e.g. "$4,664.41 CAD" or "$182.92 USD"
            value_match = re.search(r'\$([\d,]+\.?\d*)\s+(CAD|USD)', combined)
            if value_match:
                holding["market_value"] = float(value_match.group(1).replace(',', ''))
                holding["currency"] = value_match.group(2)

            # Gain/loss — e.g. "+$826.66 (+21.54%)" or "-$16.78 (-8.40%)"
            # Also handles OCR noise like "+$826.66 (+ 21.54%)."
            gain_match = re.search(
    r'([+-])\s*\$?([\d,]+\.?\d*)\s*\(\s*[+-]\s*([\d.]+)%\s*\)', combined
)
            if gain_match:
                sign = 1 if gain_match.group(1) == '+' else -1
                holding["gain_loss_dollar"] = sign * float(gain_match.group(2).replace(',', ''))
                holding["gain_loss_pct"] = sign * float(gain_match.group(3))

            if "market_value" in holding:
                holdings.append(holding)

        i += 1

    return holdings


def process_screenshot(image_bytes: bytes) -> list[dict]:
    raw_text = extract_text(image_bytes)
    print("--- RAW OCR TEXT ---")
    print(raw_text)
    print("--------------------")
    holdings = parse_holdings(raw_text)
    return holdings