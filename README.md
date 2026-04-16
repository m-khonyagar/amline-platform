# Amline Platform

Professional platform for buying, selling, renting, and operating real-estate workflows in Iran.

This repository is the active monorepo for the Amline platform. It currently includes a connected TypeScript API, a Next.js web application, operational admin views, contract workflows, and supporting infrastructure and documentation.

## Repository Layout

```text
amline-platform/
├── packages/
│   ├── api/            # TypeScript API
│   ├── web/            # Next.js frontend
│   ├── sdk/            # TypeScript SDK placeholder
│   ├── ai/             # Python AI services
│   └── integrations/   # External adapters and webhooks
├── infrastructure/     # Docker, nginx, Kubernetes, monitoring
├── database/           # SQL schema, migrations, seeds
├── docs/               # Product, engineering, and ops docs
├── scripts/            # Local run, verify, build, deploy utilities
└── .github/workflows/  # CI/CD pipelines
```

## Current Platform Shape

- People-facing web flows
- Advisor-facing contract visibility
- Admin and ops operational surfaces
- Client-aware contract access model for `people`, `advisor`, and `ops`
- Chat and complaint submission flows
- Funnel, review queue, fraud desk, and audit-log endpoints

## Quick Start

```powershell
cp .env.example .env
npm install
npm run build
npm run test
```

## Local Runtime

Start the current local stack:

```powershell
npm run local:stack
```

Start it and open the main pages in the browser:

```powershell
npm run local:stack:open
```

Stop the local stack:

```powershell
npm run local:stop
```

Verify that API and Web are connected and operational:

```powershell
npm run verify:stack
```

## Primary Commands

```powershell
npm run build
npm run test
npm run local:stack
npm run verify:stack
```

## Key URLs

- Web: [http://127.0.0.1:3000/](http://127.0.0.1:3000/)
- API health: [http://127.0.0.1:8080/api/health](http://127.0.0.1:8080/api/health)
- Contracts: [http://127.0.0.1:3000/contracts](http://127.0.0.1:3000/contracts)
- Admin: [http://127.0.0.1:3000/admin](http://127.0.0.1:3000/admin)

## Environment

Start from [.env.example](E:\CTO\amline-platform\.env.example).

Important variables:

- `PORT`
- `WEB_PORT`
- `NEXT_PUBLIC_API_BASE_URL`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`

## Docker

The repository includes a baseline [docker-compose.yml](E:\CTO\amline-platform\docker-compose.yml) and additional deployment assets in [infrastructure](E:\CTO\amline-platform\infrastructure).

## Documentation

- [API](E:\CTO\amline-platform\docs\API.md)
- [Architecture](E:\CTO\amline-platform\docs\ARCHITECTURE.md)
- [Deployment](E:\CTO\amline-platform\docs\DEPLOYMENT.md)
- [Development](E:\CTO\amline-platform\docs\DEVELOPMENT.md)
- [Database](E:\CTO\amline-platform\docs\DATABASE.md)
- [Testing](E:\CTO\amline-platform\docs\TESTING.md)
- [Security](E:\CTO\amline-platform\docs\SECURITY.md)
- [Local Dev](E:\CTO\amline-platform\docs\LOCAL_DEV.md)
- [Scale Readiness](E:\CTO\amline-platform\docs\SCALE_READINESS.md)
- [Contributing](E:\CTO\amline-platform\CONTRIBUTING.md)

## Production Note

The current `web + api` stack is locally integrated and operational. `sdk`, `ai`, and `integrations` remain partially scaffolded and should be treated as follow-on delivery tracks for full production rollout.

## License

This project is released under the [MIT License](E:\CTO\amline-platform\LICENSE).
