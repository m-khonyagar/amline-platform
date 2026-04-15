# Security

- secrets فقط از environment variables خوانده می‌شوند.
- request validation در route layer انجام می‌شود.
- rate limiting و auth middleware روی endpointهای حساس فعال است.
- logging باید فاقد داده‌های حساس باشد.
