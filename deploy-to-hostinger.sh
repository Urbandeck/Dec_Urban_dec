#!/bin/bash

# UrbanDeck Hostinger Deployment Script
# This script will deploy your application to Hostinger VPS at 72.61.245.21

set -e

VPS_IP="72.61.245.21"
VPS_USER="root"
APP_DIR="/var/www/urbandeck"

echo "=========================================="
echo "UrbanDeck Deployment to Hostinger VPS"
echo "VPS: ${VPS_IP}"
echo "=========================================="
echo ""

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "Installing sshpass for password authentication..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    else
        sudo apt-get install -y sshpass
    fi
fi

# Prompt for password once
echo -n "Enter VPS root password: "
read -s VPS_PASSWORD
echo ""

export SSHPASS="$VPS_PASSWORD"

echo "Testing connection..."
sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} 'echo "Connected successfully!"'

if [ $? -ne 0 ]; then
    echo "Failed to connect to VPS. Please check your password."
    exit 1
fi

echo ""
echo "=========================================="
echo "Step 1: Initial Server Setup"
echo "=========================================="

# Upload and run initial setup script
echo "Uploading setup script..."
sshpass -e scp -o StrictHostKeyChecking=no deploy-vps.sh ${VPS_USER}@${VPS_IP}:/tmp/

echo "Running server setup (this may take 5-10 minutes)..."
sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} 'bash /tmp/deploy-vps.sh'

echo ""
echo "=========================================="
echo "Step 2: Uploading Application Code"
echo "=========================================="

# Create app directory
sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} "mkdir -p ${APP_DIR}"

# Upload code using rsync
echo "Syncing project files..."
sshpass -e rsync -avz --progress \
  -e "ssh -o StrictHostKeyChecking=no" \
  --exclude='node_modules' \
  --exclude='target' \
  --exclude='.git' \
  --exclude='*.log' \
  ./ ${VPS_USER}@${VPS_IP}:${APP_DIR}/

echo ""
echo "=========================================="
echo "Step 3: Building Backend"
echo "=========================================="

sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} << 'ENDSSH'
cd /var/www/urbandeck/backend
echo "Building Spring Boot application..."
chmod +x mvnw
./mvnw clean package -DskipTests

# Create log directory
mkdir -p /var/log/urbandeck
chown -R www-data:www-data /var/log/urbandeck

# Setup systemd service
cp /var/www/urbandeck/urbandeck-backend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable urbandeck-backend
ENDSSH

echo ""
echo "=========================================="
echo "Step 4: Building Frontend"
echo "=========================================="

sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} << 'ENDSSH'
cd /var/www/urbandeck/frontend
echo "Installing dependencies..."
npm install

echo "Building Next.js application..."
npm run build

# Setup systemd service
cp /var/www/urbandeck/urbandeck-frontend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable urbandeck-frontend
ENDSSH

echo ""
echo "=========================================="
echo "Step 5: Configuring Nginx"
echo "=========================================="

sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} << 'ENDSSH'
# Copy nginx config
cp /var/www/urbandeck/nginx.conf /etc/nginx/sites-available/urbandeck

# Enable site
ln -sf /etc/nginx/sites-available/urbandeck /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx
nginx -t

# Reload nginx
systemctl reload nginx
ENDSSH

echo ""
echo "=========================================="
echo "Step 6: Starting Services"
echo "=========================================="

sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} << 'ENDSSH'
# Start services
systemctl start urbandeck-backend
sleep 5
systemctl start urbandeck-frontend
sleep 3

# Show status
echo ""
echo "=== Service Status ==="
systemctl status urbandeck-backend --no-pager || true
echo ""
systemctl status urbandeck-frontend --no-pager || true
ENDSSH

echo ""
echo "=========================================="
echo "✓ Deployment Complete!"
echo "=========================================="
echo ""
echo "Your application is now running at:"
echo "  http://${VPS_IP}"
echo ""
echo "To view logs:"
echo "  ssh ${VPS_USER}@${VPS_IP}"
echo "  sudo journalctl -u urbandeck-backend -f"
echo "  sudo journalctl -u urbandeck-frontend -f"
echo ""

# Unset password
unset SSHPASS
