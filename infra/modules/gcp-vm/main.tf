terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Data source for the latest Ubuntu 22.04 LTS image
data "google_compute_image" "ubuntu" {
  family  = var.image_family
  project = var.image_project
}

# Create a VPC network if not provided
resource "google_compute_network" "vpc_network" {
  count                   = var.network_name == null ? 1 : 0
  name                    = "${var.name_prefix}-network"
  auto_create_subnetworks = false
  description             = "VPC network for ${var.name_prefix}"
}

# Create a subnet if not provided
resource "google_compute_subnetwork" "subnet" {
  count         = var.subnetwork_name == null ? 1 : 0
  name          = "${var.name_prefix}-subnet"
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = var.network_name != null ? var.network_name : google_compute_network.vpc_network[0].id
  description   = "Subnet for ${var.name_prefix}"

  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# Firewall rule for SSH access
resource "google_compute_firewall" "ssh" {
  count   = var.allow_ssh ? 1 : 0
  name    = "${var.name_prefix}-allow-ssh"
  network = var.network_name != null ? var.network_name : google_compute_network.vpc_network[0].name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = var.ssh_source_ranges
  target_tags   = [var.network_tag]

  description = "Allow SSH access to instances with ${var.network_tag} tag"
}

# Firewall rule for HTTP access (optional)
resource "google_compute_firewall" "http" {
  count   = var.allow_http ? 1 : 0
  name    = "${var.name_prefix}-allow-http"
  network = var.network_name != null ? var.network_name : google_compute_network.vpc_network[0].name

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = var.http_source_ranges
  target_tags   = [var.network_tag]

  description = "Allow HTTP access to instances with ${var.network_tag} tag"
}

# Firewall rule for HTTPS access (optional)
resource "google_compute_firewall" "https" {
  count   = var.allow_https ? 1 : 0
  name    = "${var.name_prefix}-allow-https"
  network = var.network_name != null ? var.network_name : google_compute_network.vpc_network[0].name

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  source_ranges = var.https_source_ranges
  target_tags   = [var.network_tag]

  description = "Allow HTTPS access to instances with ${var.network_tag} tag"
}

# Service account for the VM
resource "google_service_account" "vm_service_account" {
  account_id   = "${var.name_prefix}-vm-sa"
  display_name = "Service Account for ${var.name_prefix} VM"
  description  = "Service account for VM instance ${var.name_prefix}"
}

# IAM binding for the service account
resource "google_project_iam_member" "vm_service_account_roles" {
  for_each = toset(var.service_account_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.vm_service_account.email}"
}

# Static IP address (optional)
resource "google_compute_address" "static_ip" {
  count        = var.create_static_ip ? 1 : 0
  name         = "${var.name_prefix}-static-ip"
  region       = var.region
  description  = "Static IP for ${var.name_prefix} VM"
  address_type = "EXTERNAL"
}

# VM instance
resource "google_compute_instance" "vm_instance" {
  name         = var.instance_name
  machine_type = var.machine_type
  zone         = var.zone

  tags = concat([var.network_tag], var.additional_tags)

  boot_disk {
    initialize_params {
      image  = data.google_compute_image.ubuntu.self_link
      size   = var.disk_size_gb
      type   = var.disk_type
      labels = var.disk_labels
    }
  }

  network_interface {
    network    = var.network_name != null ? var.network_name : google_compute_network.vpc_network[0].name
    subnetwork = var.subnetwork_name != null ? var.subnetwork_name : google_compute_subnetwork.subnet[0].name

    dynamic "access_config" {
      for_each = var.assign_external_ip ? [1] : []
      content {
        nat_ip = var.create_static_ip ? google_compute_address.static_ip[0].address : null
      }
    }
  }

  service_account {
    email  = google_service_account.vm_service_account.email
    scopes = var.service_account_scopes
  }

  metadata = merge(
    var.metadata,
    var.ssh_keys != null ? {
      ssh-keys = var.ssh_keys
    } : {},
    var.startup_script != null ? {
      startup-script = var.startup_script
    } : {}
  )

  metadata_startup_script = var.startup_script

  shielded_instance_config {
    enable_secure_boot          = var.enable_secure_boot
    enable_vtpm                 = var.enable_vtpm
    enable_integrity_monitoring = var.enable_integrity_monitoring
  }

  scheduling {
    automatic_restart   = var.automatic_restart
    on_host_maintenance = var.on_host_maintenance
    preemptible         = var.preemptible
  }

  labels = var.labels

  lifecycle {
    ignore_changes = [
      metadata["ssh-keys"],
    ]
  }

  depends_on = [
    google_compute_firewall.ssh,
    google_compute_firewall.http,
    google_compute_firewall.https,
  ]
}