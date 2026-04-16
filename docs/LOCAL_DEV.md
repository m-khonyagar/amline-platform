# Local Development

This runbook reflects the current `amline-platform` monorepo.

## Prerequisites

- Node.js 20+
- npm 10+
- PowerShell 5+ on Windows

Optional:

- Python for `packages/ai`
- Docker Desktop if you want containerized dependencies

## First-time setup

```powershell
cp .env.example .env
npm install
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

## One-command local runtime

This starts the production-style local stack for the current monorepo:

```powershell
npm run local:stack
```

If you want the main pages to open automatically in the browser:

```powershell
npm run local:stack:open
```

The script will:

- build `@amline/api`
- build `@amline/web`
- stop stale processes on ports `3000` and `8080`
- start the API on `127.0.0.1:8080`
- start the web app on `127.0.0.1:3000`
- write logs to `.runtime-logs/`

## Stop the local stack

```powershell
npm run local:stop
```

## Verify the local stack

Run the operational smoke suite after the stack is up:

```powershell
npm run verify:stack
```

This verifies:

- API health
- client-aware contract APIs for people, advisor, and ops
- audit log endpoint
- chat send
- complaint submit
- account update flows
- key web pages

## Manual commands

If you want to run the apps separately:

```powershell
npm run build -w @amline/api
npm run build -w @amline/web
npm run start -w @amline/api
npm run start -w @amline/web -- --hostname 127.0.0.1 --port 3000
```

## Important URLs

- Web: [http://127.0.0.1:3000/](http://127.0.0.1:3000/)
- API health: [http://127.0.0.1:8080/api/health](http://127.0.0.1:8080/api/health)
- Contracts: [http://127.0.0.1:3000/contracts](http://127.0.0.1:3000/contracts)
- Admin: [http://127.0.0.1:3000/admin](http://127.0.0.1:3000/admin)

## Logs

- [api.log](E:\CTO\amline-platform\.runtime-logs\api.log)
- [api.err.log](E:\CTO\amline-platform\.runtime-logs\api.err.log)
- [web.log](E:\CTO\amline-platform\.runtime-logs\web.log)
- [web.err.log](E:\CTO\amline-platform\.runtime-logs\web.err.log)
