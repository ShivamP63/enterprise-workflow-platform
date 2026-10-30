# Enterprise Workflow Management Platform

**Status:** Sprint 1 backend code added. **Not yet a verified, complete CRUD application.**

**Stack:** Java 21, Spring Boot 3, PostgreSQL, Flyway, React, TypeScript, Docker Compose.

## Local development

1. Install Java 21, Maven, Node.js and Docker Desktop.
2. In repository root run `docker compose up -d postgres` (PostgreSQL only on localhost:5433).
3. Run `cd backend && mvn test && mvn spring-boot:run`. Flyway creates tables on API startup.
4. Verify `http://localhost:8080/api/health` and create a project with `POST /api/projects`.
5. In a separate terminal run `cd frontend && npm install && npm run dev` to see the **placeholder** frontend; React CRUD integration is next.

Database account/password are **local-only defaults**. Do not expose the app on a public network: there is no authentication or project-level authorization yet.

See [API design](docs/api-design.md), [roadmap](docs/roadmap.md) and [architecture](docs/architecture.md).
