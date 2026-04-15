# Contributing

از مشارکت شما در توسعه‌ی Amline Platform استقبال می‌کنیم.

## Development Flow

1. یک branch جدید از `main` بسازید.
2. تغییرات را با تست و مستندات لازم اضافه کنید.
3. `npm run build` و `npm run test` را اجرا کنید.
4. Pull Request با توضیح روشن و قابل بازبینی باز کنید.

## Standards

- TypeScript strict mode
- Error handling و logging اجباری
- مستندسازی API و رفتارهای مهم
- تست برای منطق‌های کلیدی
- عدم commit کردن secrets و فایل‌های محیطی واقعی

## Commits

ترجیحاً از Conventional Commits استفاده کنید:

- `feat:`
- `fix:`
- `docs:`
- `refactor:`
- `test:`
- `chore:`

## Pull Requests

- دامنه‌ی تغییر کوچک و متمرکز باشد.
- اگر رفتار کاربر نهایی تغییر می‌کند، README یا docs را به‌روزرسانی کنید.
- برای migrationهای دیتابیس، rollback strategy را هم توضیح دهید.
