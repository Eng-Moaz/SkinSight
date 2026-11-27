output "app_url" {
  value = "https://${module.cloudfront.domain_name}"
}

output "frontend_public_ip" {
  value = aws_eip.frontend.public_ip
}

output "frontend_sg_id" {
  value = module.security.frontend_sg_id
}

output "backend_private_ip" {
  value = module.backend.private_ip
}

output "ansible_inventory" {
  value = <<-INVENTORY
    [frontend]
    frontend-server ansible_host=${aws_eip.frontend.public_ip}

    [backend]
    backend-server ansible_host=${module.backend.private_ip}

    [backend:vars]
    ansible_ssh_common_args='-o ProxyCommand="ssh -o StrictHostKeyChecking=no -W %h:%p ec2-user@${aws_eip.frontend.public_ip}"'

    [all:vars]
    ansible_user=ec2-user
    backend_private_ip=${module.backend.private_ip}
  INVENTORY
}
