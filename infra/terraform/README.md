# AWS shared host foundation

This Terraform stack is the shared low-cost foundation for both portfolio APIs in us-east-2. It creates one ARM64 EC2 host, two private ECR repositories, a private S3 bucket for the document platform, an EC2 instance role, and a GitHub Actions OIDC role.

It intentionally uses the default VPC and does not create a NAT gateway, load balancer, RDS instance, or other always-on network components. Authentication and per-user authorization must be merged into both applications before public API traffic is enabled.
