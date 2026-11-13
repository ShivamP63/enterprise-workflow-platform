# Development progress

2026-10-29 — Implemented Spring Boot project/task CRUD, PostgreSQL/Flyway schema, and React/TypeScript API UI.
2026-11-13 — Added complete local Docker Compose stack (PostgreSQL + Spring Boot + React/Nginx), loopback-only ports, and Playwright browser persistence test.
2026-11-13 — **M1 verified in GitHub Actions:** Java tests, PostgreSQL CRUD smoke, frontend build, and full Docker browser test all passed. [Passing CI run](https://github.com/ShivamP63/enterprise-workflow-platform/actions/runs/43396671688).
2026-11-13 — v0.1.0 local-first milestone ready; no public backend deployment, authentication or per-project access control yet.

Next: login and backend-enforced role authorization before exposing to the internet.
2026-11-13 — Public browser-only sample demo deployed to Vercel: https://enterprise-workflow-demo.vercel.app . Demo stores projects/tasks locally in the visitor's browser; Spring Boot/PostgreSQL remain local + CI-tested, not cloud-hosted. GitHub Login Connection on Vercel not set; live frontend was deployed manually from GitHub source (no automatic redeploy).
