from backend.services.enrichment_service import fetch_ticker_info

# Test a CAD holding
vfv = fetch_ticker_info("VFV", "CAD")
print("VFV:", vfv["sector"], "| beta:", vfv["beta"], "| name:", vfv["long_name"])
print("History rows:", len(vfv["history"]))

# Test a USD holding
uber = fetch_ticker_info("UBER", "USD")
print("UBER:", uber["sector"], "| beta:", uber["beta"], "| name:", uber["long_name"])