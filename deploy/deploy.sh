#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${1:?image tag is required}"
AWS_REGION="${AWS_REGION:-us-east-2}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-276663279892}"
REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE="${REGISTRY}/portfolio/workflow-api:${IMAGE_TAG}"
ENV_FILE=/opt/workflow/workflow.env
NETWORK=docai_default

if [ ! -f "${ENV_FILE}" ]; then
  echo "Missing ${ENV_FILE}; refusing to start Java without its database credentials."
  exit 1
fi
if ! docker network inspect "${NETWORK}" >/dev/null 2>&1; then
  echo "Missing Docker network ${NETWORK}; refusing to modify the Python stack."
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  TMP_DIR=$(mktemp -d)
  curl -fsSL https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip -o "${TMP_DIR}/awscliv2.zip"
  unzip -q "${TMP_DIR}/awscliv2.zip" -d "${TMP_DIR}"
  "${TMP_DIR}/aws/install" --update
  rm -rf "${TMP_DIR}"
fi

aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${REGISTRY}"
docker pull "${IMAGE}"
docker rm -f workflow-api >/dev/null 2>&1 || true

docker run -d --name workflow-api --restart unless-stopped --network "${NETWORK}" -p 8080:8080 \
  --env-file "${ENV_FILE}" "${IMAGE}"

for i in {1..30}; do
  if curl -fsS http://127.0.0.1:8080/api/health >/dev/null 2>&1; then
    echo "Java workflow API is healthy on port 8080."
    echo "--- Python health ---"
    curl -fsS http://127.0.0.1/api/health
    echo
    echo "--- Java health ---"
    curl -fsS http://127.0.0.1:8080/api/health
    echo
    exit 0
  fi
  sleep 2
done

echo "Java container started but health check did not pass."
docker logs --tail 100 workflow-api
exit 1
