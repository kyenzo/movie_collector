variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The GCP zone for the VM instance"
  type        = string
  default     = "us-central1-a"
}

variable "machine_type" {
  description = "The machine type for the VM (medium-sized for production)"
  type        = string
  default     = "e2-standard-2"
  
  validation {
    condition = contains([
      "e2-medium", "e2-standard-2", "e2-standard-4",
      "n1-standard-2", "n1-standard-4",
      "n2-standard-2", "n2-standard-4"
    ], var.machine_type)
    error_message = "Machine type must be a valid medium-to-large GCP machine type suitable for production."
  }
}

variable "disk_size_gb" {
  description = "Size of the boot disk in GB"
  type        = number
  default     = 50
  
  validation {
    condition     = var.disk_size_gb >= 20 && var.disk_size_gb <= 500
    error_message = "Disk size must be between 20 and 500 GB for production use."
  }
}

variable "disk_type" {
  description = "Type of the boot disk (SSD recommended for production)"
  type        = string
  default     = "pd-balanced"
  
  validation {
    condition     = contains(["pd-standard", "pd-ssd", "pd-balanced"], var.disk_type)
    error_message = "Disk type must be one of: pd-standard, pd-ssd, pd-balanced."
  }
}

variable "create_static_ip" {
  description = "Whether to create a static external IP address"
  type        = bool
  default     = true
}

variable "ssh_source_ranges" {
  description = "Source IP ranges allowed for SSH access (restrict to your IP/network)"
  type        = list(string)
  default     = ["0.0.0.0/0"] # WARNING: Change this to your specific IP range for security
  
  validation {
    condition = alltrue([
      for cidr in var.ssh_source_ranges : can(cidrhost(cidr, 0))
    ])
    error_message = "All SSH source ranges must be valid CIDR blocks."
  }
}

variable "ssh_user" {
  description = "Username for SSH access"
  type        = string
  default     = "ubuntu"
  
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*$", var.ssh_user))
    error_message = "SSH user must start with a letter and contain only lowercase letters, numbers, and hyphens."
  }
}

variable "ssh_public_key" {
  description = "SSH public key for accessing the instance (format: ssh-rsa AAAAB3... user@example.com)"
  type        = string
  default     = null
  sensitive   = true
  
  validation {
    condition = var.ssh_public_key == null || can(regex("^ssh-(rsa|ed25519|ecdsa)", var.ssh_public_key))
    error_message = "SSH public key must start with ssh-rsa, ssh-ed25519, or ssh-ecdsa."
  }
}

variable "allow_http" {
  description = "Whether to allow HTTP (port 80) access"
  type        = bool
  default     = true
}

variable "allow_https" {
  description = "Whether to allow HTTPS (port 443) access"
  type        = bool
  default     = true
}

variable "allow_app_port" {
  description = "Whether to allow access to the application port"
  type        = bool
  default     = true
}

variable "app_port" {
  description = "Port number for the Node.js application"
  type        = string
  default     = "5000"
  
  validation {
    condition     = can(regex("^[0-9]+$", var.app_port)) && tonumber(var.app_port) > 1024 && tonumber(var.app_port) < 65536
    error_message = "App port must be a number between 1025 and 65535."
  }
}

variable "app_source_ranges" {
  description = "Source IP ranges allowed for application access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
  
  validation {
    condition = alltrue([
      for cidr in var.app_source_ranges : can(cidrhost(cidr, 0))
    ])
    error_message = "All app source ranges must be valid CIDR blocks."
  }
}

variable "allow_postgres_external" {
  description = "Whether to allow external PostgreSQL access (NOT recommended for production)"
  type        = bool
  default     = false
}

variable "postgres_source_ranges" {
  description = "Source IP ranges allowed for PostgreSQL access (only used if allow_postgres_external is true)"
  type        = list(string)
  default     = []
  
  validation {
    condition = alltrue([
      for cidr in var.postgres_source_ranges : can(cidrhost(cidr, 0))
    ])
    error_message = "All PostgreSQL source ranges must be valid CIDR blocks."
  }
}

variable "node_version" {
  description = "Node.js version to install"
  type        = string
  default     = "18"
  
  validation {
    condition     = contains(["16", "18", "20"], var.node_version)
    error_message = "Node.js version must be 16, 18, or 20."
  }
}