#!/usr/bin/env bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl docker.io docker-compose-v2 unzip
systemctl enable --now docker
usermod -aG docker ubuntu

# The Free Plan eligible t4g.small has 2 GiB RAM. Add swap for the two low-traffic demo stacks.
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile swap swap defaults 0 0' >> /etc/fstab
fi

mkdir -p /opt/portfolio
chown ubuntu:ubuntu /opt/portfolio
echo "Foundation host ready; application deployment is performed by GitHub Actions or the local temporary AWS session." > /opt/portfolio/README.txt
