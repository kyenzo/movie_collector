variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*[a-z0-9]$", var.name_prefix))
    error_message = "Name prefix must start with a letter, contain only lowercase letters, numbers, and hyphens, and end with a letter or number."
  }
}

variable "instance_name" {
  description = "Name of the VM instance"
  type        = string
  default     = null
}

variable "machine_type" {
  description = "The machine type for the VM instance"
  type        = string
  default     = "e2-medium"
  validation {
    condition = contains([
      "e2-micro", "e2-small", "e2-medium", "e2-standard-2", "e2-standard-4",
      "n1-standard-1", "n1-standard-2", "n1-standard-4",
      "n2-standard-2", "n2-standard-4", "n2-standard-8"
    ], var.machine_type)
    error_message = "Machine type must be a valid GCP machine type."
  }
}

variable "image_family" {
  description = "The image family for the boot disk"
  type        = string
  default     = "ubuntu-2204-lts"
}

variable "image_project" {
  description = "The project containing the image"
  type        = string
  default     = "ubuntu-os-cloud"
}

variable "disk_size_gb" {
  description = "Size of the boot disk in GB"
  type        = number
  default     = 20
  validation {
    condition     = var.disk_size_gb >= 10 && var.disk_size_gb <= 2048
    error_message = "Disk size must be between 10 and 2048 GB."
  }
}

variable "disk_type" {
  description = "Type of the boot disk"
  type        = string
  default     = "pd-standard"
  validation {
    condition     = contains(["pd-standard", "pd-ssd", "pd-balanced"], var.disk_type)
    error_message = "Disk type must be one of: pd-standard, pd-ssd, pd-balanced."
  }
}

variable "disk_labels" {
  description = "Labels to apply to the boot disk"
  type        = map(string)
  default     = {}
}

variable "network_name" {
  description = "Name of the VPC network (if null, a new network will be created)"
  type        = string
  default     = null
}

variable "subnetwork_name" {
  description = "Name of the subnetwork (if null, a new subnetwork will be created)"
  type        = string
  default     = null
}

variable "subnet_cidr" {
  description = "CIDR range for the subnet (only used if creating a new subnet)"
  type        = string
  default     = "10.0.0.0/24"
  validation {
    condition     = can(cidrhost(var.subnet_cidr, 0))
    error_message = "Subnet CIDR must be a valid IPv4 CIDR block."
  }
}

variable "network_tag" {
  description = "Network tag for firewall rules"
  type        = string
  default     = "vm-instance"
}

variable "additional_tags" {
  description = "Additional network tags to apply to the instance"
  type        = list(string)
  default     = []
}

variable "assign_external_ip" {
  description = "Whether to assign an external IP address"
  type        = bool
  default     = true
}

variable "create_static_ip" {
  description = "Whether to create a static external IP address"
  type        = bool
  default     = false
}

variable "allow_ssh" {
  description = "Whether to allow SSH access via firewall"
  type        = bool
  default     = true
}

variable "ssh_source_ranges" {
  description = "Source IP ranges for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "allow_http" {
  description = "Whether to allow HTTP access via firewall"
  type        = bool
  default     = false
}

variable "http_source_ranges" {
  description = "Source IP ranges for HTTP access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "allow_https" {
  description = "Whether to allow HTTPS access via firewall"
  type        = bool
  default     = false
}

variable "https_source_ranges" {
  description = "Source IP ranges for HTTPS access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "ssh_keys" {
  description = "SSH public keys for the instance (format: username:ssh-rsa AAAAB3... user@example.com)"
  type        = string
  default     = null
  sensitive   = true
}

variable "startup_script" {
  description = "Startup script to run on instance boot"
  type        = string
  default     = null
}

variable "metadata" {
  description = "Additional metadata for the instance"
  type        = map(string)
  default     = {}
}

variable "labels" {
  description = "Labels to apply to the instance"
  type        = map(string)
  default     = {}
}

variable "service_account_roles" {
  description = "IAM roles to assign to the service account"
  type        = list(string)
  default = [
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter"
  ]
}

variable "service_account_scopes" {
  description = "Service account scopes"
  type        = list(string)
  default = [
    "https://www.googleapis.com/auth/logging.write",
    "https://www.googleapis.com/auth/monitoring.write",
    "https://www.googleapis.com/auth/devstorage.read_only"
  ]
}

variable "enable_secure_boot" {
  description = "Enable Secure Boot for shielded VM"
  type        = bool
  default     = true
}

variable "enable_vtpm" {
  description = "Enable vTPM for shielded VM"
  type        = bool
  default     = true
}

variable "enable_integrity_monitoring" {
  description = "Enable integrity monitoring for shielded VM"
  type        = bool
  default     = true
}

variable "automatic_restart" {
  description = "Whether the instance should automatically restart if it crashes"
  type        = bool
  default     = true
}

variable "on_host_maintenance" {
  description = "What to do when Compute Engine must perform periodic maintenance"
  type        = string
  default     = "MIGRATE"
  validation {
    condition     = contains(["MIGRATE", "TERMINATE"], var.on_host_maintenance)
    error_message = "On host maintenance must be either MIGRATE or TERMINATE."
  }
}

variable "preemptible" {
  description = "Whether the instance is preemptible"
  type        = bool
  default     = false
}