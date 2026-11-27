#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${1:?image tag is required}"
AWS_REGION="${AWS_REGION:-us-east-2}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-276663279892}"
IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/portfolio/workflow-api:${IMAGE_TAG}"
DOC_DIR=/opt/docai
DOC_ENV="${DOC_DIR}/.env"
NETWORK=docai_default

if [ ! -f "${DOC_ENV}" ]; then
  echo "Missing ${DOC_ENV}; refusing to start Java without the existing database credentials."
  exit 1
fi

set -a
. "${DOC_ENV}"
set +a
: "${POSTGRES_USER:?POSTGRES_USER is missing from /opt/docai/.env}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is missing from /opt/docai/.env}"

docker network inspect "${NETWORK}" >/dev/null 2>&1 || {
  echo "Missing Docker network ${NETWORK}; refusing to modify the Python stack."
  exit 1
}

docker pull "${IMAGE}"
docker rm -f workflow-api >/dev/null 2>&1 || true

docker run -d --name workflow-api --restart unless-stopped --network "${NETWORK}" -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://postgres:5432/workflow" \
  -e SPRING_DATASOURCE_USERNAME="${POSTGRES_USER}" \
  -e SPRING_DATASOURCE_PASSWORD="${POSTGRES_PASSWORD}" \
  -e APP_JWT_SECRET="${APP_JWT_SECRET:-local-development-secret-change-this-value-123456789}" \
  -e APP_JWT_EXPIRATION="${APP_JWT_EXPIRATION:-PT2H}" \
  -e APP_CORS_ALLOWED_ORIGINS="${APP_CORS_ALLOWED_ORIGINS:-http://localhost:5173,http://127.0.0.1:5173}" \
  "${IMAGE}"

for i in {1..30}; do
  if curl -fsS http://127.0.0.1:8080/actuator/health >/dev/null 2>&1 || curl -fsS http://127.0.0.1:8080/api/health >/dev/null 2>&1; then
    echo "Java workflow API is healthy on port 8080."
    exit 0
  fi
  sleep 2
done

echo "Java container started but health check did not pass."
docker logs --tail 80 workflow-api
exit 1
