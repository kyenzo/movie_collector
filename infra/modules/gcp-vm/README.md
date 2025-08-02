# GCP VM Terraform Module

This Terraform module creates a secure Google Cloud Platform (GCP) virtual machine with best practices for security and networking.

## Features

- **Secure by Default**: Shielded VM with Secure Boot, vTPM, and integrity monitoring
- **Network Security**: Configurable firewall rules with restricted source ranges
- **Service Account**: Dedicated service account with minimal required permissions
- **Flexible Networking**: Can use existing VPC/subnet or create new ones
- **SSH Access**: Configurable SSH access with custom key management
- **Static IP**: Optional static external IP address
- **Monitoring**: Built-in logging and monitoring integration
- **Validation**: Input validation for critical parameters

## Usage

```hcl
module "secure_vm" {
  source = "./modules/gcp-vm"

  project_id    = "my-gcp-project"
  region        = "us-central1"
  zone          = "us-central1-a"
  name_prefix   = "my-app"
  instance_name = "my-app-vm"
  
  # Machine configuration
  machine_type  = "e2-medium"
  disk_size_gb  = 30
  disk_type     = "pd-balanced"
  
  # Network configuration
  assign_external_ip = true
  create_static_ip   = true
  
  # Security configuration
  allow_ssh         = true
  ssh_source_ranges = ["203.0.113.0/24"] # Replace with your IP range
  ssh_keys          = "username:ssh-rsa AAAAB3... user@example.com"
  
  # Optional HTTP/HTTPS access
  allow_http  = true
  allow_https = true
  
  # Labels and metadata
  labels = {
    environment = "production"
    application = "web-server"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| project_id | The GCP project ID | `string` | n/a | yes |
| region | The GCP region | `string` | `"us-central1"` | no |
| zone | The GCP zone | `string` | `"us-central1-a"` | no |
| name_prefix | Prefix for resource names | `string` | n/a | yes |
| instance_name | Name of the VM instance | `string` | `null` | no |
| machine_type | The machine type for the VM instance | `string` | `"e2-medium"` | no |
| disk_size_gb | Size of the boot disk in GB | `number` | `20` | no |
| disk_type | Type of the boot disk | `string` | `"pd-standard"` | no |
| assign_external_ip | Whether to assign an external IP address | `bool` | `true` | no |
| create_static_ip | Whether to create a static external IP address | `bool` | `false` | no |
| allow_ssh | Whether to allow SSH access via firewall | `bool` | `true` | no |
| ssh_source_ranges | Source IP ranges for SSH access | `list(string)` | `["0.0.0.0/0"]` | no |
| ssh_keys | SSH public keys for the instance | `string` | `null` | no |
| allow_http | Whether to allow HTTP access via firewall | `bool` | `false` | no |
| allow_https | Whether to allow HTTPS access via firewall | `bool` | `false` | no |
| enable_secure_boot | Enable Secure Boot for shielded VM | `bool` | `true` | no |
| enable_vtpm | Enable vTPM for shielded VM | `bool` | `true` | no |
| enable_integrity_monitoring | Enable integrity monitoring for shielded VM | `bool` | `true` | no |

## Outputs

| Name | Description |
|------|-------------|
| instance_id | The ID of the VM instance |
| instance_name | The name of the VM instance |
| internal_ip | The internal IP address of the VM instance |
| external_ip | The external IP address of the VM instance |
| static_ip | The static IP address (if created) |
| service_account_email | The email of the service account |
| ssh_command | SSH command to connect to the instance |

## Security Best Practices

This module implements several security best practices:

1. **Shielded VM**: Enabled by default with Secure Boot, vTPM, and integrity monitoring
2. **Dedicated Service Account**: Each VM gets its own service account with minimal permissions
3. **Network Security**: Firewall rules with configurable source IP ranges
4. **SSH Key Management**: Supports custom SSH keys with lifecycle management
5. **Disk Encryption**: Uses Google-managed encryption keys by default
6. **Monitoring**: Enables Cloud Logging and Monitoring by default

## Examples

### Basic VM with SSH Access
```hcl
module "basic_vm" {
  source = "./modules/gcp-vm"
  
  project_id  = "my-project"
  name_prefix = "basic"
  
  ssh_keys = "myuser:ssh-rsa AAAAB3NzaC1yc2EAAAADAQAB... myuser@example.com"
}
```

### Web Server VM
```hcl
module "web_server" {
  source = "./modules/gcp-vm"
  
  project_id    = "my-project"
  name_prefix   = "webserver"
  machine_type  = "e2-standard-2"
  disk_size_gb  = 50
  
  allow_http    = true
  allow_https   = true
  create_static_ip = true
  
  startup_script = file("${path.module}/scripts/install-nginx.sh")
}
```

## Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.0 |
| google | ~> 5.0 |

## Providers

| Name | Version |
|------|---------|
| google | ~> 5.0 |