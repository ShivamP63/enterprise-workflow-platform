# Enterprise Workflow Management Platform

**Status: Initial scaffold — CRUD is not implemented yet.**

React + TypeScript frontend; Java 21/Spring Boot REST API; PostgreSQL (Docker Compose). This repository is currently a development skeleton with a static UI and a health endpoint. Do not deploy publicly before authentication and authorization are implemented.

## Local setup

1. Install Java 21, Maven, Node.js, and Docker Desktop.
2. Start PostgreSQL: `docker compose up -d postgres`.
3. Start API: `cd backend && mvn spring-boot:run` (health: `http://localhost:8080/api/health`).
4. Start UI in another terminal: `cd frontend && npm install && npm run dev`.

The database credentials are **local demonstration defaults**, not suitable for public hosting. Configure local overrides using environment variables. Application features and end-to-end testing remain outstanding.

See [roadmap](docs/roadmap.md), [architecture](docs/architecture.md), and [API plan](docs/api-design.md).
