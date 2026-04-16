# Scale Readiness

## Important Truth First

This repository can be hardened for high concurrency, but no code change inside a single repo can honestly guarantee that "one million simultaneous users" will be safe without:

- realistic traffic profiling
- persistent shared data stores
- distributed caching
- multi-zone deployment
- load, soak, and failure testing
- observability and on-call readiness

What this repo now provides is a stronger scale-ready baseline for those next stages.

## What Was Added

### API Runtime Hardening

The API now includes:

- readiness endpoint: `/api/ready`
- liveness endpoint: `/api/live`
- Prometheus-style metrics endpoint: `/api/metrics`
- request-id propagation via `X-Request-Id`
- request body size limits
- overload protection using max in-flight request guards
- slow-request warning logs
- keep-alive, headers, and request timeout tuning
- graceful shutdown and drain behavior for rolling deploys

Relevant file:

- [packages/api/src/server.ts](E:\CTO\amline-platform\packages\api\src\server.ts)

### Kubernetes Readiness

The Kubernetes manifests now include:

- rolling update strategy with zero unavailable pods
- readiness, liveness, and startup probes
- resource requests and limits
- topology spread constraints
- HorizontalPodAutoscaler for API and Web
- PodDisruptionBudget for API and Web
- Ingress baseline with upstream keepalive and protection annotations

Relevant files:

- [infrastructure/kubernetes/api-deployment.yaml](E:\CTO\amline-platform\infrastructure\kubernetes\api-deployment.yaml)
- [infrastructure/kubernetes/web-deployment.yaml](E:\CTO\amline-platform\infrastructure\kubernetes\web-deployment.yaml)
- [infrastructure/kubernetes/services.yaml](E:\CTO\amline-platform\infrastructure\kubernetes\services.yaml)
- [infrastructure/kubernetes/autoscaling.yaml](E:\CTO\amline-platform\infrastructure\kubernetes\autoscaling.yaml)
- [infrastructure/kubernetes/poddisruptionbudgets.yaml](E:\CTO\amline-platform\infrastructure\kubernetes\poddisruptionbudgets.yaml)
- [infrastructure/kubernetes/ingress.yaml](E:\CTO\amline-platform\infrastructure\kubernetes\ingress.yaml)

### Edge Proxy Tuning

Nginx now includes:

- upstream keepalive
- `least_conn` balancing
- gzip
- request and connection limiting
- static asset cache hints
- proxy timeout tuning

Relevant file:

- [infrastructure/nginx/nginx.conf](E:\CTO\amline-platform\infrastructure\nginx\nginx.conf)

### Local Operational Tooling

You can now start, stop, and verify the stack using:

```powershell
npm run local:stack
npm run verify:stack
npm run local:stop
```

### Load Testing

Two k6 profiles were added:

```powershell
npm run load:smoke
npm run load:soak
```

Relevant files:

- [scripts/load/k6-api-smoke.js](E:\CTO\amline-platform\scripts\load\k6-api-smoke.js)
- [scripts/load/k6-api-soak.js](E:\CTO\amline-platform\scripts\load\k6-api-soak.js)

## Remaining Gaps Before True Massive Scale

These are still major blockers for real million-user readiness:

1. In-memory state still exists in parts of the API.
   Chat, complaints, and some operational datasets are not backed by durable distributed storage.

2. No real distributed cache tier is wired in.
   Redis is declared, but hot read paths are not yet cache-optimized.

3. No database connection pooling strategy is implemented here.
   Real scale needs PgBouncer or equivalent plus query budgeting.

4. No CDN strategy is encoded for static and media traffic.
   Web scale at this level must offload static assets away from origin.

5. No queue-based write buffering exists.
   High-volume writes should move to Kafka, RabbitMQ, SQS, or equivalent async pipelines.

6. No SLO/SLA alerting or dashboards are defined in detail.
   Metrics endpoint exists, but alert rules and dashboards must be finalized.

7. No chaos or failover tests have been codified yet.
   Multi-zone and dependency-failure rehearsals are still needed.

## CTO Recommendation

Treat the current state as:

- good for local verification
- better prepared for horizontal scaling
- substantially safer for rolling deploys
- not yet a truthful claim for one million simultaneous production users

The next serious phase should be:

1. Externalize all mutable state to durable shared systems.
2. Add Redis caching and queue-backed write paths.
3. Put the web behind a CDN and WAF.
4. Add database pooling and read replicas.
5. Run staged k6 tests against a production-like cluster.
6. Define SLOs, alerts, dashboards, and autoscaling policies from measured data.
