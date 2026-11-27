# Infrastructure

```
Users -> CloudFront -> frontend server (public subnet) -> backend server (private subnet)
```

## Layout

```
envs/dev/    main.tf connects the modules, backend.tf stores the state in S3
modules/     vpc, subnet, nat, security, ec2, cloudfront
ansible/     playbook.yml installs Docker and runs both containers
```

## Workflows

| Workflow | When it runs | What it does |
|---|---|---|
| CD | push to `main` | builds and pushes both images, then calls Apply if `AUTO_DEPLOY` is `true` |
| Apply | called by CD, or by hand | Terraform creates the servers, Ansible deploys the containers |
| Destroy | by hand only | deletes everything |

Terraform writes the server IPs into the Ansible inventory, so nothing is copied by hand.
SSH is opened for the GitHub runner only while Ansible runs.

## Setup (once)

In the repository, open Settings, then Secrets and variables, then Actions.

| Type | Name | Value |
|---|---|---|
| Secret | `AWS_ROLE_ARN` | ARN of the AWS role GitHub logs in with |
| Secret | `SSH_PRIVATE_KEY` | full contents of the `depi-tasks` private key file |
| Variable | `AUTO_DEPLOY` | `true` to deploy on every push to `main` |

The AWS role must trust this repository and have EC2, CloudFront, SSM parameter and state bucket access.

## Cost

The servers, NAT gateway and public IPs cost money while they exist.
To stop: set `AUTO_DEPLOY` to `false`, then run Destroy.
Otherwise the next push creates everything again.
