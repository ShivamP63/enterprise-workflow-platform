#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${1:?image tag is required}"
AWS_REGION="${AWS_REGION:-us-east-2}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-276663279892}"
IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/portfolio/workflow-api:${IMAGE_TAG}"
APP_DIR=/opt/portfolio
ENV_FILE="${APP_DIR}/workflow.env"
NETWORK=portfolio-network

mkdir -p "${APP_DIR}"
if [ ! -f "${ENV_FILE}" ]; then
  cat > "${ENV_FILE}" <<'ENV'
POSTGRES_DB=workflow
POSTGRES_USER=workflow
POSTGRES_PASSWORD=change-this-local-password
APP_JWT_SECRET=change-this-jwt-secret-before-production
APP_JWT_EXPIRATION=PT2H
APP_CORS_ALLOWED_ORIGINS=*
ENV
  chmod 600 "${ENV_FILE}"
fi
set -a
. "${ENV_FILE}"
set +a

docker network inspect "${NETWORK}" >/dev/null 2>&1 || docker network create "${NETWORK}"
docker pull "${IMAGE}"

docker rm -f workflow-api >/dev/null 2>&1 || true
docker rm -f workflow-postgres >/dev/null 2>&1 || true

docker run -d --name workflow-postgres --restart unless-stopped --network "${NETWORK}" \
  -e POSTGRES_DB="${POSTGRES_DB}" -e POSTGRES_USER="${POSTGRES_USER}" -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
  -v workflow_pg_data:/var/lib/postgresql/data postgres:16-alpine

for i in {1..30}; do
  if docker exec workflow-postgres pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null 2>&1; then break; fi
  sleep 2
done

docker run -d --name workflow-api --restart unless-stopped --network "${NETWORK}" -p 8080:8080 \
  --env-file "${ENV_FILE}" \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://workflow-postgres:5432/${POSTGRES_DB}" \
  -e SPRING_DATASOURCE_USERNAME="${POSTGRES_USER}" \
  -e SPRING_DATASOURCE_PASSWORD="${POSTGRES_PASSWORD}" \
  "${IMAGE}"

docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'
