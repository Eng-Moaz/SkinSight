resource "aws_security_group" "frontend" {
  name   = "skinsight-frontend-sg"
  vpc_id = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "frontend_http" {
  security_group_id = aws_security_group.frontend.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "frontend_out" {
  security_group_id = aws_security_group.frontend.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_security_group" "backend" {
  name   = "skinsight-backend-sg"
  vpc_id = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "backend_api" {
  security_group_id            = aws_security_group.backend.id
  referenced_security_group_id = aws_security_group.frontend.id
  from_port                    = 8000
  to_port                      = 8000
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "backend_ssh" {
  security_group_id            = aws_security_group.backend.id
  referenced_security_group_id = aws_security_group.frontend.id
  from_port                    = 22
  to_port                      = 22
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "backend_out" {
  security_group_id = aws_security_group.backend.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}
