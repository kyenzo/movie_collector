#!/bin/bash

# Movie Collector Production VM Startup Script
# This script runs when the VM starts for the first time

set -euo pipefail

# Variables from Terraform
NODE_VERSION="${node_version}"
APP_PORT="${app_port}"

# Log everything
exec > >(tee /var/log/startup-script.log)
exec 2>&1

echo "=== Movie Collector VM Startup Script Started ==="
echo "Timestamp: $(date)"
echo "Node.js Version: $NODE_VERSION"
echo "App Port: $APP_PORT"

# Update system packages
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install essential packages
echo "Installing essential packages..."
apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    vim \
    htop \
    ufw \
    fail2ban \
    nginx \
    certbot \
    python3-certbot-nginx

# Install Docker and Docker Compose
echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Docker Compose
echo "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js using NodeSource repository
echo "Installing Node.js version $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

# Verify installations
echo "Verifying installations..."
node --version
npm --version
docker --version
docker-compose --version

# Create application user
echo "Creating application user..."
useradd -m -s /bin/bash movieapp
usermod -aG docker movieapp

# Create application directories
echo "Creating application directories..."
mkdir -p /opt/movie-collector
mkdir -p /var/log/movie-collector
chown -R movieapp:movieapp /opt/movie-collector
chown -R movieapp:movieapp /var/log/movie-collector

# Configure UFW firewall
echo "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow $APP_PORT/tcp

# Configure fail2ban for SSH protection
echo "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Create systemd service for the application
echo "Creating systemd service..."
cat > /etc/systemd/system/movie-collector.service << EOF
[Unit]
Description=Movie Collector Application
After=network.target
Wants=network.target

[Service]
Type=simple
User=movieapp
Group=movieapp
WorkingDirectory=/opt/movie-collector
Environment=NODE_ENV=production
Environment=PORT=$APP_PORT
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=movie-collector

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx as reverse proxy
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/movie-collector << 'EOF'
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/movie-collector /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl enable nginx
systemctl restart nginx

# Configure automatic security updates
echo "Configuring automatic security updates..."
apt-get install -y unattended-upgrades
cat > /etc/apt/apt.conf.d/20auto-upgrades << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

# Create deployment script
echo "Creating deployment script..."
cat > /opt/movie-collector/deploy.sh << 'EOF'
#!/bin/bash

# Movie Collector Deployment Script
set -euo pipefail

REPO_URL="https://github.com/your-username/movie-collector.git"
APP_DIR="/opt/movie-collector"
BACKUP_DIR="/opt/movie-collector-backup"

echo "Starting deployment..."

# Create backup of current version
if [ -d "$APP_DIR/server" ]; then
    echo "Creating backup..."
    rm -rf "$BACKUP_DIR"
    cp -r "$APP_DIR" "$BACKUP_DIR"
fi

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    echo "Updating repository..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "Cloning repository..."
    rm -rf "$APP_DIR"
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# Install dependencies
echo "Installing dependencies..."
cd server
npm ci --production

# Start/restart application
echo "Restarting application..."
sudo systemctl daemon-reload
sudo systemctl enable movie-collector
sudo systemctl restart movie-collector

# Check status
sleep 5
if sudo systemctl is-active --quiet movie-collector; then
    echo "Deployment successful!"
else
    echo "Deployment failed. Check logs with: sudo journalctl -u movie-collector -f"
    exit 1
fi
EOF

chmod +x /opt/movie-collector/deploy.sh
chown movieapp:movieapp /opt/movie-collector/deploy.sh

# Set up log rotation
echo "Setting up log rotation..."
cat > /etc/logrotate.d/movie-collector << EOF
/var/log/movie-collector/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF

# Create startup complete indicator
echo "Creating startup complete indicator..."
touch /var/log/startup-complete
echo "$(date): Startup script completed successfully" >> /var/log/startup-complete

echo "=== Movie Collector VM Startup Script Completed ==="
echo "Next steps:"
echo "1. SSH into the VM: gcloud compute ssh movie-collector-production-vm --zone=us-central1-a"
echo "2. Run the deployment script: sudo -u movieapp /opt/movie-collector/deploy.sh"
echo "3. Configure your domain and SSL certificate with: sudo certbot --nginx"
echo "4. Check application status: sudo systemctl status movie-collector"