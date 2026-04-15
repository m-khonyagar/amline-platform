# Amline Platform

پلتفرمی حرفه‌ای برای خرید، فروش و اجاره‌ی ملک‌های ایران.

این مخزن نسخه‌ی عمومی و قابل‌گسترش Amline Platform است و دو هدف را هم‌زمان پوشش می‌دهد:

1. نگه‌داری کدهای موجود و زیرسیستم‌های عملیاتی که از پروژه‌ی داخلی منتقل شده‌اند.
2. ارائه‌ی یک ساختار monorepo استاندارد و production-ready برای توسعه‌ی API، وب، SDK، هوش مصنوعی و integrationها.

## Repository Layout

```text
amline-platform/
├── packages/
│   ├── api/            # TypeScript API service
│   ├── web/            # Next.js web app
│   ├── sdk/            # TypeScript SDK
│   ├── ai/             # Python AI services
│   └── integrations/   # External adapters & webhooks
├── infrastructure/     # Docker, nginx, Kubernetes, monitoring
├── database/           # SQL schema, migrations, seeds
├── docs/               # Product and engineering docs
├── scripts/            # Local/dev/build/test/deploy scripts
└── .github/workflows/  # CI/CD pipelines
```

## Key Capabilities

- مدیریت املاک، جست‌وجو و فیلتر
- صورتحساب، پرداخت و settlement
- مدیریت مجوزهای قانونی و شکایات
- رتبه‌بندی، افتخارات و سیستم انگیزشی
- فرصت‌های شغلی و فرآیند جذب
- سرویس‌های AI برای قیمت‌گذاری، پیشنهاد، تقلب و تحلیل محتوا
- integration با سرویس‌های بیرونی و webhook fanout

## Quick Start

```bash
cp .env.example .env
npm install
npm run build
npm run test
docker compose up --build
```

## Workspace Commands

```bash
npm run dev
npm run build
npm run lint
npm run test
```

## Packages

- `packages/api`: API مبتنی بر TypeScript و Express
- `packages/web`: وب‌اپلیکیشن Next.js برای کاربران، مشاوران و مدیریت
- `packages/sdk`: کلاینت رسمی TypeScript برای اتصال به API
- `packages/ai`: سرویس‌های Python برای مدل‌های تحلیلی و هوشمند
- `packages/integrations`: adapterها و webhook orchestration

## Production Notes

- متغیرهای محیطی از `.env.example` شروع می‌شوند.
- کانفیگ Docker و Nginx در `infrastructure/` نگه‌داری می‌شود.
- migrations و seeds در `database/` قرار دارند.
- pipelineهای build/test/deploy در `.github/workflows/` تعریف شده‌اند.

## Documentation

- [API](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Development](docs/DEVELOPMENT.md)
- [Database](docs/DATABASE.md)
- [Testing](docs/TESTING.md)
- [Security](docs/SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## License

این پروژه تحت [MIT](LICENSE) منتشر شده است.
