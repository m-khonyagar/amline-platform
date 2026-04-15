# Deployment

## Local

```bash
docker compose up --build
```

## Staging

- اجرای workflow `deploy-staging.yml`
- استفاده از imageهای versioned
- اجرای migration پیش از rollout اپلیکیشن

## Production

- اجرای workflow `deploy-production.yml`
- rollout مرحله‌ای
- health check و log monitoring
