def detect_fraud(payload: dict) -> dict:
    amount = payload.get("amount", 0)
    return {"flagged": amount > 100000000000, "risk_score": 0.8 if amount > 100000000000 else 0.1}
