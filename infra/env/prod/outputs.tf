output "vm_instance_id" {
  description = "The ID of the VM instance"
  value       = module.movie_collector_vm.instance_id
}

output "vm_instance_name" {
  description = "The name of the VM instance"
  value       = module.movie_collector_vm.instance_name
}

output "vm_internal_ip" {
  description = "The internal IP address of the VM instance"
  value       = module.movie_collector_vm.internal_ip
}

output "vm_external_ip" {
  description = "The external IP address of the VM instance"
  value       = module.movie_collector_vm.external_ip
}

output "vm_static_ip" {
  description = "The static IP address (if created)"
  value       = module.movie_collector_vm.static_ip
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = module.movie_collector_vm.ssh_command
}

output "application_url" {
  description = "URL to access the application"
  value       = var.allow_app_port ? "http://${module.movie_collector_vm.external_ip}:${var.app_port}" : "Application port not exposed"
}

output "https_url" {
  description = "HTTPS URL (if HTTPS is enabled and SSL is configured)"
  value       = var.allow_https ? "https://${module.movie_collector_vm.external_ip}" : "HTTPS not enabled"
}

output "service_account_email" {
  description = "Email of the service account used by the VM"
  value       = module.movie_collector_vm.service_account_email
}

output "network_name" {
  description = "Name of the VPC network"
  value       = module.movie_collector_vm.network_name
}

output "zone" {
  description = "Zone where the VM is deployed"
  value       = module.movie_collector_vm.zone
}

output "machine_type" {
  description = "Machine type of the VM"
  value       = module.movie_collector_vm.machine_type
}

output "firewall_rules" {
  description = "Created firewall rules"
  value = {
    ssh       = module.movie_collector_vm.firewall_rules.ssh
    http      = module.movie_collector_vm.firewall_rules.http
    https     = module.movie_collector_vm.firewall_rules.https
    app_port  = var.allow_app_port ? google_compute_firewall.app_port[0].name : null
    postgres  = var.allow_postgres_external ? google_compute_firewall.postgres[0].name : null
  }
}