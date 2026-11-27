terraform {
  backend "s3" {
    bucket       = "depi-kubeadm-tfstate-512880383039"
    key          = "skinsight/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }
}
