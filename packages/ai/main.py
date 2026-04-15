from services.price_predictor import predict_price


if __name__ == "__main__":
    print({"status": "ok", "sample_prediction": predict_price("تهران", 120)})
