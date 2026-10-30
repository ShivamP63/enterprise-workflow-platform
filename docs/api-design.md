# REST API — Sprint 1 backend
All routes are unauthenticated; run only on your local machine. No public deployment until M2 authorization.

| Method | Endpoint | Payload |
|---|---|---|
| GET | /api/health | - |
| GET / POST | /api/projects | POST: `{"name":"Demo Project","description":"Optional"}` |
| GET / PATCH | /api/projects/{id} | PATCH: `{"name":"New name","status":"ARCHIVED"}` |
| GET / POST | /api/projects/{projectId}/tasks | POST: `{"title":"Review draft","priority":"HIGH","dueDate":"2026-11-10"}` |
| PATCH | /api/tasks/{id} | `{"status":"IN_PROGRESS"}` |

Status: Projects ACTIVE/ARCHIVED; tasks TODO/IN_PROGRESS/DONE; priority LOW/MEDIUM/HIGH. PATCH only changes provided non-null fields.

**Pending:** React UI integration, actual PostgreSQL migration execution and end-to-end demo.
