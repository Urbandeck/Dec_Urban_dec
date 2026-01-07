#!/bin/bash

# UrbanDeck VPS Migration Script
# Migrates from 72.61.245.21 to 145.223.19.157
# Frontend will run on port 3003

set -e

# VPS Credentials
OLD_VPS="72.61.245.21"
NEW_VPS="145.223.19.157"
VPS_USER="root"
VPS_PASS="Akarvilabs@11"
APP_DIR="/var/www/urbandeck"
FRONTEND_PORT="3003"

echo "=========================================="
echo "UrbanDeck VPS Migration Script"
echo "From: ${OLD_VPS}"
echo "To: ${NEW_VPS}"
echo "Frontend Port: ${FRONTEND_PORT}"
echo "=========================================="
echo ""

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "Installing sshpass..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    else
        sudo apt-get install -y sshpass
    fi
fi

export SSHPASS="$VPS_PASS"

echo "=========================================="
echo "STEP 1: Backup Current VPS"
echo "=========================================="

echo "Creating backup directory on old VPS..."
sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${OLD_VPS} << 'ENDSSH'
mkdir -p /tmp/urbandeck-backup
cd /tmp/urbandeck-backup

# Backup PostgreSQL database
echo "Backing up database..."
sudo -u postgres pg_dump digitalframes_shop > database-backup.sql

# Backup uploaded files if any
echo "Backing up uploaded files..."
if [ -d "/var/www/urbandeck/backend/uploads" ]; then
    tar -czf uploads-backup.tar.gz -C /var/www/urbandeck/backend uploads/
fi

# Backup environment files
echo "Backing up environment files..."
cp /var/www/urbandeck/.env.production env-backup.txt 2>/dev/null || true

ls -lh /tmp/urbandeck-backup/
ENDSSH

echo "Downloading backups from old VPS..."
mkdir -p ./vps-backup
sshpass -e scp -o StrictHostKeyChecking=no ${VPS_USER}@${OLD_VPS}:/tmp/urbandeck-backup/* ./vps-backup/

echo "✓ Backup completed!"
echo ""

echo "=========================================="
echo "STEP 2: Setup New VPS"
echo "=========================================="

echo "Installing required software on new VPS..."
sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${NEW_VPS} << 'ENDSSH'
set -e

# Update system
echo "Updating system..."
apt update && apt upgrade -y

# Install Java 17
echo "Installing Java 17..."
apt install -y openjdk-17-jdk

# Install Node.js 18
echo "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
echo "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Install Nginx
echo "Installing Nginx..."
apt install -y nginx

# Install Maven
echo "Installing Maven..."
apt install -y maven

# Install PM2
echo "Installing PM2..."
npm install -g pm2

# Configure firewall
echo "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8080/tcp
ufw allow 3003/tcp
ufw --force enable

# Create application directory
echo "Creating application directory..."
mkdir -p /var/www/urbandeck
mkdir -p /var/log/urbandeck

# Setup PostgreSQL database
echo "Setting up PostgreSQL database..."
sudo -u postgres psql << EOF
CREATE DATABASE digitalframes_shop;
CREATE USER digitalframes_user WITH PASSWORD 'DF@Shop2024!Secure';
GRANT ALL PRIVILEGES ON DATABASE digitalframes_shop TO digitalframes_user;
ALTER DATABASE digitalframes_shop OWNER TO digitalframes_user;
\q
EOF

echo "✓ New VPS setup completed!"
ENDSSH

echo ""

echo "=========================================="
echo "STEP 3: Transfer Application Code"
echo "=========================================="

echo "Uploading application code to new VPS..."
sshpass -e rsync -avz --progress \
  -e "ssh -o StrictHostKeyChecking=no" \
  --exclude='node_modules' \
  --exclude='target' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='vps-backup' \
  ./ ${VPS_USER}@${NEW_VPS}:${APP_DIR}/

echo "✓ Code transferred!"
echo ""

echo "=========================================="
echo "STEP 4: Restore Database Backup"
echo "=========================================="

echo "Uploading database backup..."
sshpass -e scp -o StrictHostKeyChecking=no ./vps-backup/database-backup.sql ${VPS_USER}@${NEW_VPS}:/tmp/

echo "Restoring database..."
sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${NEW_VPS} << 'ENDSSH'
sudo -u postgres psql digitalframes_shop < /tmp/database-backup.sql
rm /tmp/database-backup.sql
echo "✓ Database restored!"
ENDSSH

echo ""

echo "=========================================="
echo "STEP 5: Build Backend"
echo "=========================================="

sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${NEW_VPS} << 'ENDSSH'
cd /var/www/urbandeck/backend

echo "Building Spring Boot application..."
chmod +x mvnw
./mvnw clean package -DskipTests

echo "✓ Backend built successfully!"
ENDSSH

echo ""

echo "=========================================="
echo "STEP 6: Build Frontend (Port 3003)"
echo "=========================================="

sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${NEW_VPS} << 'ENDSSH'
cd /var/www/urbandeck/frontend

# Update .env.local for port 3003
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://urbandec.in/api
NODE_ENV=production
PORT=3003
EOF

echo "Installing dependencies..."
npm install

echo "Building Next.js application..."
npm run build

echo "✓ Frontend built successfully!"
ENDSSH

echo ""

echo "=========================================="
echo "STEP 7: Setup Systemd Services"
echo "=========================================="

echo "Creating backend service..."
sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${NEW_VPS} << 'ENDSSH'
cat > /etc/systemd/system/urbandeck-backend.service << 'EOF'
[Unit]
Description=UrbanDeck Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/urbandeck/backend
EnvironmentFile=/var/www/urbandeck/.env.production
ExecStart=/usr/bin/java -jar /var/www/urbandeck/backend/target/shop-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=append:/var/log/urbandeck/backend.log
StandardError=append:/var/log/urbandeck/backend-error.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable urbandeck-backend
ENDSSH

echo "Creating frontend service (port 3003)..."
sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${NEW_VPS} << 'ENDSSH'
cat > /etc/systemd/system/urbandeck-frontend.service << 'EOF'
[Unit]
Description=UrbanDeck Frontend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/urbandeck/frontend
Environment="NODE_ENV=production"
Environment="PORT=3003"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=append:/var/log/urbandeck/frontend.log
StandardError=append:/var/log/urbandeck/frontend-error.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable urbandeck-frontend
ENDSSH

echo ""

echo "=========================================="
echo "STEP 8: Configure Nginx"
echo "=========================================="

sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${NEW_VPS} << 'ENDSSH'
cat > /etc/nginx/sites-available/urbandeck << 'EOF'
server {
    listen 80;
    server_name urbandec.in www.urbandec.in 145.223.19.157;

    client_max_body_size 100M;

    # Frontend - Next.js on port 3003
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API - Spring Boot on port 8080
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/urbandeck /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx

echo "✓ Nginx configured!"
ENDSSH

echo ""

echo "=========================================="
echo "STEP 9: Start Services"
echo "=========================================="

sshpass -e ssh -o StrictHostKeyChecking=no ${VPS_USER}@${NEW_VPS} << 'ENDSSH'
echo "Starting backend..."
systemctl start urbandeck-backend
sleep 5

echo "Starting frontend..."
systemctl start urbandeck-frontend
sleep 3

echo ""
echo "=== Service Status ==="
systemctl status urbandeck-backend --no-pager || true
echo ""
systemctl status urbandeck-frontend --no-pager || true
echo ""

echo "=== Testing endpoints ==="
echo "Backend health check:"
curl -s http://localhost:8080/api/health || echo "Backend not responding yet"
echo ""
echo "Frontend check:"
curl -s -I http://localhost:3003 | head -n 1 || echo "Frontend not responding yet"
ENDSSH

echo ""
echo "=========================================="
echo "✓ MIGRATION COMPLETED!"
echo "=========================================="
echo ""
echo "Your application is now running on the new VPS!"
echo ""
echo "Access via IP: http://145.223.19.157"
echo ""
echo "NEXT STEPS:"
echo "1. Test the application at: http://145.223.19.157"
echo "2. Update DNS A record for urbandec.in to: 145.223.19.157"
echo "3. After DNS propagation, install SSL:"
echo "   ssh root@145.223.19.157"
echo "   apt install -y certbot python3-certbot-nginx"
echo "   certbot --nginx -d urbandec.in -d www.urbandec.in"
echo ""
echo "To view logs:"
echo "  Backend: ssh root@145.223.19.157 'journalctl -u urbandeck-backend -f'"
echo "  Frontend: ssh root@145.223.19.157 'journalctl -u urbandeck-frontend -f'"
echo ""

# Cleanup
unset SSHPASS
