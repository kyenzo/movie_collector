output "instance_id" {
  description = "The ID of the VM instance"
  value       = google_compute_instance.vm_instance.id
}

output "instance_name" {
  description = "The name of the VM instance"
  value       = google_compute_instance.vm_instance.name
}

output "instance_self_link" {
  description = "The self link of the VM instance"
  value       = google_compute_instance.vm_instance.self_link
}

output "internal_ip" {
  description = "The internal IP address of the VM instance"
  value       = google_compute_instance.vm_instance.network_interface[0].network_ip
}

output "external_ip" {
  description = "The external IP address of the VM instance"
  value       = var.assign_external_ip ? google_compute_instance.vm_instance.network_interface[0].access_config[0].nat_ip : null
}

output "static_ip" {
  description = "The static IP address (if created)"
  value       = var.create_static_ip ? google_compute_address.static_ip[0].address : null
}

output "network_name" {
  description = "The name of the VPC network"
  value       = var.network_name != null ? var.network_name : google_compute_network.vpc_network[0].name
}

output "subnetwork_name" {
  description = "The name of the subnetwork"
  value       = var.subnetwork_name != null ? var.subnetwork_name : google_compute_subnetwork.subnet[0].name
}

output "service_account_email" {
  description = "The email of the service account"
  value       = google_service_account.vm_service_account.email
}

output "zone" {
  description = "The zone of the VM instance"
  value       = google_compute_instance.vm_instance.zone
}

output "machine_type" {
  description = "The machine type of the VM instance"
  value       = google_compute_instance.vm_instance.machine_type
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = var.assign_external_ip ? "gcloud compute ssh ${google_compute_instance.vm_instance.name} --zone=${google_compute_instance.vm_instance.zone}" : "Use internal IP: ${google_compute_instance.vm_instance.network_interface[0].network_ip}"
}

output "firewall_rules" {
  description = "Created firewall rules"
  value = {
    ssh   = var.allow_ssh ? google_compute_firewall.ssh[0].name : null
    http  = var.allow_http ? google_compute_firewall.http[0].name : null
    https = var.allow_https ? google_compute_firewall.https[0].name : null
  }
}