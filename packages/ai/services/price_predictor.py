def predict_price(city: str, area: int) -> int:
    base = 85000000 if city == "تهران" else 35000000
    return base * area
