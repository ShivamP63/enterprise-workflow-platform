# Enterprise Workflow Management Platform

**v0.1.0 local-first milestone verified in CI — automated browser-to-PostgreSQL test passed on 2026-11-13.**

A full-stack business workflow application for managing team projects and tasks. Built to explore practical backend architecture, relational data modeling, React user interfaces, and reliable API-driven workflows.

**Tech stack:** Java 21 · Spring Boot · REST APIs · PostgreSQL · Flyway · React · TypeScript · Docker Compose

## Project overview

The first workflow is designed around creating a project, adding and updating tasks, and viewing persisted changes in a React application. The repository contains the Sprint 1 application foundation, and the browser-to-PostgreSQL flow has been verified by an automated Docker + Playwright test in GitHub Actions.

### Planned development milestones

1. **Sprint 1 — Foundation:** Project/task APIs, PostgreSQL schema and migrations, React UI, initial tests; **implemented and verified by automated browser test in CI**.
2. **Authentication & authorization:** User login, project membership, role-based access, authorization tests.
3. **Collaboration:** Task assignments, comments, filters, and activity history.
4. **Quality & deployment:** More integration tests, CI, containerization, observability, and a controlled cloud release.

The roadmap describes **planned features**, not released functionality. See [roadmap](docs/roadmap.md), [architecture](docs/architecture.md), and [API design](docs/api-design.md).

## One-command Docker demo (local)

With Docker Desktop running, execute this at the repository root:

```bash
docker compose up -d --build
```

Open **http://localhost:5173** (React UI) and **http://localhost:8080/api/health** (Spring Boot health endpoint). Create a project, add a task, update its status, and refresh to confirm PostgreSQL persistence. Stop the app using `docker compose down`; database data persists in a named Docker volume unless explicitly removed.

GitHub Actions includes a Playwright browser test that exercises this exact workflow through the Dockerized UI, API, and PostgreSQL. The application remains **local-only** until user authentication and server-side authorization are implemented. Do not expose ports or publish this demo as a public service.

## Manual local development

1. Install Java 21, Maven, Node.js and Docker Desktop.
2. In the repository root run `docker compose up -d postgres` (PostgreSQL bound to localhost:5433).
3. Run `cd backend && mvn test && mvn spring-boot:run`. Flyway creates tables on startup.
4. Verify `http://localhost:8080/api/health`.
5. In a second terminal run `cd frontend && npm install && npm run dev`. Open `http://localhost:5173`.
6. Create a project, add a task, change its status, refresh the page, and confirm the records persist. **This exact workflow passed the automated browser test in CI; manual walkthrough is optional.**

**Local development only:** Docker Compose database credentials are development defaults. Do not expose the application publicly before authentication and per-project authorization are implemented.
