import cv2
import pytesseract
import numpy as np
import re
from PIL import Image
import io

# Point pytesseract at the Tesseract binary on Windows
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Convert raw image bytes into a cleaned, high-contrast grayscale image
    that Tesseract can read accurately.
    """
    # Decode bytes into a numpy array OpenCV can work with
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Convert to grayscale — Tesseract works best on grayscale images
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Upscale the image — Tesseract accuracy improves significantly on
    # larger text. 2x scaling is a reliable general boost.
    scaled = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    # Apply mild blur to reduce noise before thresholding
    blurred = cv2.GaussianBlur(scaled, (3, 3), 0)

    # Adaptive thresholding converts the image to pure black and white.
    # This handles uneven lighting and makes text pop cleanly.
    thresh = cv2.adaptiveThreshold(
        blurred, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11, 2
    )

    return thresh

def extract_text(image_bytes: bytes) -> str:
    """
    Run Tesseract OCR on the preprocessed image and return raw text.
    """
    processed = preprocess_image(image_bytes)

    # PSM 6 tells Tesseract to treat the image as a single uniform block of text.
    # This works well for list-style layouts like the Wealthsimple holdings page.
    custom_config = r"--oem 3 --psm 6"
    raw_text = pytesseract.image_to_string(processed, config=custom_config)

    return raw_text

def parse_holdings(raw_text: str) -> list[dict]:
    """
    Parse raw OCR text into a structured list of holdings.
    Each holding is a dictionary with ticker, shares, market_value,
    currency, gain_loss_dollar, and gain_loss_pct.
    """
    holdings = []
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]

    i = 0
    while i < len(lines):
        line = lines[i]

        # Match a ticker — 2 to 5 uppercase letters on their own line
        ticker_match = re.match(r"^([A-Z]{2,5})$", line)

        if ticker_match:
            ticker = ticker_match.group(1)
            holding = {"ticker": ticker}

            # Look ahead through the next few lines to find the associated data
            for j in range(i + 1, min(i + 5, len(lines))):
                next_line = lines[j]

                # Match shares — e.g. "28.3086 shares" or "10 shares"
                shares_match = re.search(r"([\d,]+\.?\d*)\s+shares", next_line)
                if shares_match and "shares" not in holding:
                    holding["shares"] = float(shares_match.group(1).replace(",", ""))

                # Match market value — e.g. "$4,664.41 CAD" or "$182.92 USD"
                value_match = re.search(r"\$([\d,]+\.?\d*)\s+(CAD|USD)", next_line)
                if value_match and "market_value" not in holding:
                    holding["market_value"] = float(value_match.group(1).replace(",", ""))
                    holding["currency"] = value_match.group(2)

                # Match gain/loss — e.g. "+$826.66 (+21.54%)" or "-$16.78 (-8.40%)"
                gain_match = re.search(
                    r"([+-])\$([\d,]+\.?\d*)\s+\(([+-][\d.]+)%\)", next_line
                )
                if gain_match and "gain_loss_pct" not in holding:
                    sign = 1 if gain_match.group(1) == "+" else -1
                    holding["gain_loss_dollar"] = sign * float(gain_match.group(2).replace(",", ""))
                    holding["gain_loss_pct"] = float(gain_match.group(3))

            # Only add holding if we captured at least the ticker and value
            if "market_value" in holding:
                holdings.append(holding)

        i += 1

    return holdings

def process_screenshot(image_bytes: bytes) -> list[dict]:
    """
    Main entry point for the OCR service.
    Takes raw image bytes, returns a clean list of parsed holdings.
    """
    raw_text = extract_text(image_bytes)
    print("--- RAW OCR TEXT ---")
    print(raw_text)
    print("--------------------")
    holdings = parse_holdings(raw_text)
    return holdings