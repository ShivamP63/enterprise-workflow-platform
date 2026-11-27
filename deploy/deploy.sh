#!/bin/sh
set -eu

IMAGE_TAG="${1:?image tag is required}"
AWS_REGION="${AWS_REGION:-us-east-2}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-276663279892}"
REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE="${REGISTRY}/portfolio/workflow-api:${IMAGE_TAG}"
ENV_FILE="/opt/workflow/workflow.env"
NETWORK="docai_default"

if [ ! -f "${ENV_FILE}" ]; then
  echo "Missing ${ENV_FILE}. Run the workflow database setup before deploying." >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  if ! command -v unzip >/dev/null 2>&1; then
    apt-get update -y
    apt-get install -y unzip
  fi

  TMP_DIR="$(mktemp -d)"
  case "$(uname -m)" in
    aarch64|arm64) AWSCLI_ARCH="aarch64" ;;
    x86_64|amd64) AWSCLI_ARCH="x86_64" ;;
    *) echo "Unsupported host architecture: $(uname -m)" >&2; exit 1 ;;
  esac

  curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-${AWSCLI_ARCH}.zip" -o "${TMP_DIR}/awscliv2.zip"
  unzip -q "${TMP_DIR}/awscliv2.zip" -d "${TMP_DIR}"
  "${TMP_DIR}/aws/install" --update
  rm -rf "${TMP_DIR}"
fi

aws ecr get-login-password --region "${AWS_REGION}" |   docker login --username AWS --password-stdin "${REGISTRY}"

docker pull "${IMAGE}"
docker rm -f workflow-api >/dev/null 2>&1 || true

docker run -d   --name workflow-api   --restart unless-stopped   --network "${NETWORK}"   -p 8080:8080   --env-file "${ENV_FILE}"   "${IMAGE}"

i=0
while ! curl -fsS http://127.0.0.1:8080/api/health >/tmp/workflow-health.out 2>/tmp/workflow-health.err; do
  i=$((i + 1))
  if [ "${i}" -ge 60 ]; then
    cat /tmp/workflow-health.err >&2 || true
    docker logs --tail 100 workflow-api >&2 || true
    exit 1
  fi
  sleep 2
done

cat /tmp/workflow-health.out
curl -fsS http://127.0.0.1/api/health >/dev/null
echo
echo "Python and Java services are healthy"
