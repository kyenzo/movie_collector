terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # Backend configuration - uncomment and configure for remote state
  # backend "gcs" {
  #   bucket = "your-terraform-state-bucket"
  #   prefix = "movie-collector/prod"
  # }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
}

# Local values for common configurations
locals {
  environment = "production"
  application = "movie-collector"
  
  common_labels = {
    environment = local.environment
    application = local.application
    managed_by  = "terraform"
    team        = "development"
  }
  
  # SSH key - replace with your actual SSH public key
  ssh_key = var.ssh_public_key != null ? "${var.ssh_user}:${var.ssh_public_key}" : null
}

# Create the production VM using the GCP VM module
module "movie_collector_vm" {
  source = "../../modules/gcp-vm"

  # Basic configuration
  project_id    = var.project_id
  region        = var.region
  zone          = var.zone
  name_prefix   = "${local.application}-${local.environment}"
  instance_name = "${local.application}-${local.environment}-vm"

  # Machine specifications for medium-sized VM
  machine_type = var.machine_type
  disk_size_gb = var.disk_size_gb
  disk_type    = var.disk_type

  # Network configuration
  assign_external_ip = true
  create_static_ip   = var.create_static_ip

  # Security configuration
  allow_ssh         = true
  ssh_source_ranges = var.ssh_source_ranges
  ssh_keys          = local.ssh_key

  # Application ports (for Node.js app and PostgreSQL)
  allow_http  = var.allow_http
  allow_https = var.allow_https

  # Custom firewall rules for application
  additional_tags = ["movie-collector-app"]

  # Shielded VM configuration (security best practices)
  enable_secure_boot          = true
  enable_vtpm                 = true
  enable_integrity_monitoring = true

  # Service account permissions
  service_account_roles = [
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/compute.instanceAdmin.v1"
  ]

  # Startup script for initial setup
  startup_script = templatefile("${path.module}/scripts/startup.sh", {
    node_version = var.node_version
    app_port     = var.app_port
  })

  # Metadata
  metadata = {
    enable-oslogin = "TRUE"
    serial-port-enable = "FALSE"
    block-project-ssh-keys = "FALSE"
  }

  # Labels
  labels = merge(local.common_labels, {
    cost_center = "engineering"
    backup      = "daily"
  })

  # Disk labels
  disk_labels = local.common_labels
}

# Additional firewall rule for Node.js application
resource "google_compute_firewall" "app_port" {
  count   = var.allow_app_port ? 1 : 0
  name    = "${local.application}-${local.environment}-allow-app"
  network = module.movie_collector_vm.network_name

  allow {
    protocol = "tcp"
    ports    = [var.app_port]
  }

  source_ranges = var.app_source_ranges
  target_tags   = ["movie-collector-app"]

  description = "Allow access to Movie Collector application port"
}

# Additional firewall rule for PostgreSQL (if needed for external access)
resource "google_compute_firewall" "postgres" {
  count   = var.allow_postgres_external ? 1 : 0
  name    = "${local.application}-${local.environment}-allow-postgres"
  network = module.movie_collector_vm.network_name

  allow {
    protocol = "tcp"
    ports    = ["5432"]
  }

  source_ranges = var.postgres_source_ranges
  target_tags   = ["movie-collector-app"]

  description = "Allow external PostgreSQL access (use with caution)"
}