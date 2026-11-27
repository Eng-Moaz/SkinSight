resource "aws_eip" "this" {
  domain = "vpc"

  tags = {
    Name = "skinsight-nat-eip"
  }
}

resource "aws_nat_gateway" "this" {
  allocation_id = aws_eip.this.id
  subnet_id     = var.public_subnet_id

  tags = {
    Name = "skinsight-nat"
  }
}

resource "aws_route_table" "private" {
  vpc_id = var.vpc_id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.this.id
  }

  tags = {
    Name = "skinsight-private-rt"
  }
}
