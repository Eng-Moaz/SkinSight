resource "aws_subnet" "this" {
  vpc_id            = var.vpc_id
  cidr_block        = var.cidr
  availability_zone = var.az

  tags = {
    Name = var.name
  }
}

resource "aws_route_table_association" "this" {
  subnet_id      = aws_subnet.this.id
  route_table_id = var.route_table_id
}
