# Architecture

Amline Platform با رویکرد modular monorepo طراحی شده است.

- `packages/api`: لایه‌ی backend و business services
- `packages/web`: تجربه‌ی کاربری و پنل‌های front-facing
- `packages/sdk`: مصرف API برای ابزارها و partnerها
- `packages/ai`: سرویس‌های تحلیل هوشمند
- `packages/integrations`: اتصال به سرویس‌های بیرونی
- `database`: schema، migrations و seeds
- `infrastructure`: استقرار محلی، staging و production
