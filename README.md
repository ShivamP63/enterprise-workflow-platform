# Enterprise Workflow Management Platform

**Status:** Sprint 1 source implemented; end-to-end PostgreSQL verification pending.

**Stack:** Java 21, Spring Boot, PostgreSQL, Flyway, React, TypeScript, Docker Compose.

## Local development

1. Install Java 21, Maven, Node.js and Docker Desktop.
2. In repository root run `docker compose up -d postgres` (PostgreSQL bound to localhost:5433).
3. Run `cd backend && mvn test && mvn spring-boot:run`. Flyway creates tables on startup.
4. Verify `http://localhost:8080/api/health`.
5. In a second terminal run `cd frontend && npm install && npm run dev`. Open `http://localhost:5173`.
6. Create a project, add a task, change its status, refresh the page, and confirm the records persist.

Database credentials in Docker Compose are **local-only defaults**. Do not expose the app on a public network: authentication and per-project authorization are not implemented yet.

See [API design](docs/api-design.md), [roadmap](docs/roadmap.md) and [architecture](docs/architecture.md).
