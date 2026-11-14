variable "aws_region" {
  type    = string
  default = "us-east-2"
}

variable "github_owner" {
  type    = string
  default = "ShivamP63"
}

variable "workflow_repository" {
  type    = string
  default = "enterprise-workflow-platform"
}

variable "document_repository" {
  type    = string
  default = "intelligent-document-ai-platform"
}

variable "instance_type" {
  type    = string
  default = "t4g.medium"
}

variable "ssh_cidr" {
  type        = string
  description = "Optional temporary SSH CIDR. Leave empty when using SSM only."
  default     = ""
}
