# Amline Deployment Guide (Production)

## 1. Server آماده‌سازی

```bash
sudo apt update
sudo apt install docker docker-compose -y
```

## 2. clone repo

```bash
git clone https://github.com/m-khonyagar/amline-platform.git
cd next-gen
```

## 3. تنظیم env

```bash
cp .env.production.example .env
nano .env
```

## 4. اجرا

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## 5. تست

```bash
curl http://localhost/api/contracts
```

## 6. SSL (پیشنهاد)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d amline.ir -d api.amline.ir
```

## 7. دامنه

DNS باید به IP سرور اشاره کند

people.amline.ir → server IP
advisor.amline.ir → server IP
ops.amline.ir → server IP
api.amline.ir → server IP

## وضعیت نهایی

اگر همه چیز درست باشد:

- UI در domainها بالا می‌آید
- API در /api پاسخ می‌دهد
- قرارداد قابل ایجاد و امضا است
