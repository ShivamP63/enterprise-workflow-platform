output "instance_id" { value = aws_instance.host.id }
output "instance_public_ip" { value = aws_instance.host.public_ip }
output "workflow_ecr_repository" { value = aws_ecr_repository.workflow.repository_url }
output "document_ecr_repository" { value = aws_ecr_repository.documents.repository_url }
output "document_bucket" { value = aws_s3_bucket.documents.bucket }
output "github_deploy_role_arn" { value = try(aws_iam_role.github_deploy[0].arn, null) }
