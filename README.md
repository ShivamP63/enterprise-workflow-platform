# Enterprise Workflow Management Platform

## Live authenticated demo

**[Enterprise Workflow public demo](https://enterprise-workflow-demo.vercel.app)** — hosted on Vercel.

The public frontend now uses the authenticated Spring Boot API through the same-origin `/api` path. Vercel rewrites API requests to the HTTPS backend, so browser requests remain same-origin and avoid direct browser-to-EC2 CORS issues. Users can register, sign in, create projects, add tasks, update task status, and persist changes in PostgreSQL through the API.

**Production verification:** `/api/health` returns the workflow service health response, and the deployed login flow reaches the backend. The current production deployment is READY from commit `9b19dd2`.

A full-stack business workflow application for managing team projects and tasks. Built to explore practical backend architecture, relational data modeling, React user interfaces, authentication, and reliable API-driven workflows.

**Tech stack:** Java 21 · Spring Boot · REST APIs · PostgreSQL · Flyway · React · TypeScript · Docker Compose · GitHub Actions

## Project overview

The workflow supports creating projects, adding and updating tasks, and viewing persisted changes in a React application. The repository contains the Spring Boot API, PostgreSQL schema and migrations, authenticated React UI, Docker Compose setup, and CI checks.

### Implemented capabilities

- User registration and JWT sign-in
- Authenticated project and task APIs
- PostgreSQL persistence with Flyway migrations
- React and TypeScript workspace UI
- Task status and priority management
- Docker Compose local environment
- GitHub Actions backend and frontend checks
- Browser-to-database verification through the Dockerized stack

### Planned development milestones

1. **Foundation:** Project/task APIs, PostgreSQL schema and migrations, React UI, authentication, and initial tests; **implemented and verified in CI**.
2. **Authorization depth:** Project membership, role-based access, and authorization tests.
3. **Collaboration:** Task assignments, comments, filters, and activity history.
4. **Quality and operations:** More integration tests, observability, and controlled cloud hardening.

See [roadmap](docs/roadmap.md), [architecture](docs/architecture.md), and [API design](docs/api-design.md).

## One-command Docker demo local

With Docker Desktop running, execute this at the repository root:

```bash
docker compose up -d --build
```

Open **http://localhost:5173** (React UI) and **http://localhost:8080/api/health** (Spring Boot health endpoint). Register or sign in, create a project, add a task, update its status, and refresh to confirm PostgreSQL persistence. Stop the app using `docker compose down`; database data persists in a named Docker volume unless explicitly removed.

GitHub Actions includes browser checks that exercise the Dockerized UI, API, and PostgreSQL workflow.

## Manual local development

1. Install Java 21, Maven, Node.js and Docker Desktop.
2. In the repository root run `docker compose up -d --build`.
3. Verify `http://localhost:8080/api/health`.
4. Open `http://localhost:5173`.
5. Register or sign in, create a project, add a task, change its status, refresh the page, and confirm the records persist.

**Local development only:** Docker Compose database credentials are development defaults. Use strong secrets and restrict network access before deploying outside a controlled environment.

## Deployment notes

The Vercel frontend uses the checked-in `frontend/vercel.json` rewrite for `/api/:path*`. The frontend does not call the backend IP directly from the browser. The Vercel project is connected to this repository, and production deployments are created from the repository's main branch.

The Docker Compose stack remains the reproducible local and CI validation environment. The hosted demo is a real authenticated API integration, not a localStorage-only mock.
