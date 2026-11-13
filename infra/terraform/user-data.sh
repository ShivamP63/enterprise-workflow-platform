#!/usr/bin/env bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl docker.io docker-compose-plugin unzip
systemctl enable --now docker
usermod -aG docker ubuntu
mkdir -p /opt/portfolio
chown ubuntu:ubuntu /opt/portfolio
echo "Foundation host ready; application deployment is performed by GitHub Actions." > /opt/portfolio/README.txt
