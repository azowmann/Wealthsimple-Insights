from backend.services.ocr_service import process_screenshot

with open("test_screenshot.png", "rb") as f:
    image_bytes = f.read()

holdings = process_screenshot(image_bytes)

for h in holdings:
    print(h)