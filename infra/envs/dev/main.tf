terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_ssm_parameter" "ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

module "vpc" {
  source = "../../modules/vpc"
}

module "public_subnet" {
  source         = "../../modules/subnet"
  name           = "skinsight-public"
  vpc_id         = module.vpc.id
  cidr           = "10.0.1.0/24"
  az             = "us-east-1a"
  route_table_id = module.vpc.public_route_table_id
}

module "nat" {
  source           = "../../modules/nat"
  vpc_id           = module.vpc.id
  public_subnet_id = module.public_subnet.id

  depends_on = [module.vpc]
}

module "private_subnet" {
  source         = "../../modules/subnet"
  name           = "skinsight-private"
  vpc_id         = module.vpc.id
  cidr           = "10.0.2.0/24"
  az             = "us-east-1a"
  route_table_id = module.nat.private_route_table_id
}

module "security" {
  source = "../../modules/security"
  vpc_id = module.vpc.id
}

module "frontend" {
  source            = "../../modules/ec2"
  name              = "skinsight-frontend"
  ami               = data.aws_ssm_parameter.ami.value
  instance_type     = "t3.micro"
  subnet_id         = module.public_subnet.id
  security_group_id = module.security.frontend_sg_id
  key_name          = var.key_name
}

module "backend" {
  source            = "../../modules/ec2"
  name              = "skinsight-backend"
  ami               = data.aws_ssm_parameter.ami.value
  instance_type     = "t3.small"
  subnet_id         = module.private_subnet.id
  security_group_id = module.security.backend_sg_id
  key_name          = var.key_name
}

resource "aws_eip" "frontend" {
  domain   = "vpc"
  instance = module.frontend.id

  depends_on = [module.vpc]
}

module "cloudfront" {
  source        = "../../modules/cloudfront"
  origin_domain = aws_eip.frontend.public_dns
}
