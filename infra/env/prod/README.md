# Movie Collector Production Infrastructure

This directory contains Terraform configuration for deploying the Movie Collector application to Google Cloud Platform in a production environment.

## Architecture Overview

- **VM Instance**: Secure, medium-sized GCP VM with shielded VM features
- **Network**: Dedicated VPC with proper firewall rules
- **Security**: SSH key-based access, UFW firewall, fail2ban protection
- **Application**: Node.js app with Nginx reverse proxy
- **Database**: PostgreSQL running in Docker container
- **SSL**: Let's Encrypt certificate support via Certbot
- **Monitoring**: Cloud Logging and Monitoring integration

## Prerequisites

1. **GCP Project**: Active GCP project with billing enabled
2. **APIs Enabled**:
   ```bash
   gcloud services enable compute.googleapis.com
   gcloud services enable iam.googleapis.com
   gcloud services enable logging.googleapis.com
   gcloud services enable monitoring.googleapis.com
   ```
3. **Terraform**: Version >= 1.0 installed
4. **GCP Authentication**: 
   ```bash
   gcloud auth application-default login
   ```
5. **SSH Key Pair**: Generate SSH keys for VM access

## Quick Start

### 1. Configure Variables

Copy the example variables file and customize it:
```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:
```hcl
project_id = "your-gcp-project-id"
region     = "us-central1"
zone       = "us-central1-a"

# Security - IMPORTANT: Restrict SSH access to your IP
ssh_source_ranges = ["YOUR.IP.ADDRESS/32"]
ssh_user         = "your-username"
ssh_public_key   = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQAB... your-username@your-machine"
```

### 2. Generate SSH Keys (if needed)

```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com" -f ~/.ssh/movie-collector-prod
```

Add the public key content to `terraform.tfvars`:
```bash
cat ~/.ssh/movie-collector-prod.pub
```

### 3. Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the configuration
terraform apply
```

### 4. Connect to VM

After deployment, use the SSH command from the output:
```bash
# Get SSH command
terraform output ssh_command

# Or connect directly
gcloud compute ssh movie-collector-production-vm --zone=us-central1-a
```

### 5. Deploy Application

On the VM, run the deployment script:
```bash
sudo -u movieapp /opt/movie-collector/deploy.sh
```

### 6. Configure SSL (Optional)

```bash
# Install SSL certificate
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Security Features

### VM Security
- **Shielded VM**: Secure Boot, vTPM, and integrity monitoring enabled
- **OS Login**: Google-managed SSH keys
- **Firewall**: UFW configured with minimal required ports
- **Intrusion Prevention**: fail2ban for SSH protection
- **Automatic Updates**: Unattended security updates enabled

### Network Security
- **Restricted SSH**: Configurable source IP ranges
- **Firewall Rules**: Minimal required ports (22, 80, 443, 5000)
- **Service Account**: Dedicated SA with minimal permissions
- **Network Tags**: Targeted firewall rules

### Application Security
- **Reverse Proxy**: Nginx with security headers
- **SSL/TLS**: Let's Encrypt certificate support
- **Process Isolation**: Dedicated application user
- **Log Monitoring**: Centralized logging

## Configuration Options

### VM Sizing
| Machine Type | vCPUs | Memory | Use Case |
|--------------|--------|---------|----------|
| e2-medium | 1 | 4GB | Development |
| e2-standard-2 | 2 | 8GB | Production (Default) |
| e2-standard-4 | 4 | 16GB | High Traffic |

### Disk Options
| Type | Performance | Cost | Use Case |
|------|------------|------|----------|
| pd-standard | Standard | Low | Development |
| pd-balanced | Good | Medium | Production (Default) |
| pd-ssd | High | High | High I/O |

## Monitoring and Maintenance

### Check Application Status
```bash
# Application service status
sudo systemctl status movie-collector

# View application logs
sudo journalctl -u movie-collector -f

# Check Nginx status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### System Health
```bash
# System resources
htop

# Disk usage
df -h

# Network connections
ss -tulpn
```

### Updates and Maintenance
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart application
sudo systemctl restart movie-collector

# Renew SSL certificate
sudo certbot renew
```

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker exec movie_collector_db pg_dump -U postgres movie_collector > backup.sql

# Restore backup
docker exec -i movie_collector_db psql -U postgres movie_collector < backup.sql
```

### Application Backup
```bash
# The deployment script automatically creates backups
# Location: /opt/movie-collector-backup
```

## Cost Optimization

### Estimated Monthly Costs (us-central1)
- **e2-standard-2**: ~$50/month
- **50GB pd-balanced disk**: ~$4/month
- **Static IP**: ~$4/month
- **Egress traffic**: Variable based on usage

### Cost Reduction Tips
1. Use preemptible instances for development
2. Schedule VM shutdown during off-hours
3. Use pd-standard disks for non-critical workloads
4. Monitor egress traffic

## Troubleshooting

### Common Issues

#### Cannot SSH to VM
```bash
# Check firewall rules
gcloud compute firewall-rules list --filter="name~'ssh'"

# Check VM status
gcloud compute instances describe movie-collector-production-vm --zone=us-central1-a
```

#### Application Not Starting
```bash
# Check service logs
sudo journalctl -u movie-collector -n 50

# Check if port is listening
sudo ss -tulpn | grep 5000

# Check startup script logs
sudo tail -f /var/log/startup-script.log
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Check Nginx configuration
sudo nginx -t
```

## Clean Up

To destroy all resources:
```bash
terraform destroy
```

**Warning**: This will permanently delete all resources including the VM and any data stored on it.

## Support and Documentation

- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [GCP Compute Engine](https://cloud.google.com/compute/docs)
- [Let's Encrypt](https://letsencrypt.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)