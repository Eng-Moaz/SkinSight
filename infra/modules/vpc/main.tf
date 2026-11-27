resource "aws_vpc" "this" {
  cidr_block           = var.cidr
  enable_dns_hostnames = true

  tags = {
    Name = "skinsight-vpc"
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "skinsight-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name = "skinsight-public-rt"
  }
}
