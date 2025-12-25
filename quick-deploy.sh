#!/bin/bash

# Quick deployment script for UrbanDeck on Hostinger VPS
# Run this after initial server setup and uploading code

set -e

echo "=================================="
echo "UrbanDeck Quick Deployment"
echo "=================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "pom.xml" ] && [ ! -f "backend/pom.xml" ]; then
    echo -e "${RED}Error: Must run from project root directory${NC}"
    exit 1
fi

# Determine project structure
if [ -f "backend/pom.xml" ]; then
    BACKEND_DIR="backend"
    FRONTEND_DIR="frontend"
else
    BACKEND_DIR="."
    FRONTEND_DIR="../frontend"
fi

echo -e "${YELLOW}Step 1: Building Backend...${NC}"
cd $BACKEND_DIR
./mvnw clean package -DskipTests
echo -e "${GREEN}Backend build complete!${NC}"

echo -e "${YELLOW}Step 2: Creating log directory...${NC}"
sudo mkdir -p /var/log/urbandeck
sudo chown -R www-data:www-data /var/log/urbandeck
echo -e "${GREEN}Log directory created!${NC}"

echo -e "${YELLOW}Step 3: Installing Backend service...${NC}"
if [ "$BACKEND_DIR" = "backend" ]; then
    cd ..
fi
sudo cp urbandeck-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable urbandeck-backend
sudo systemctl restart urbandeck-backend
echo -e "${GREEN}Backend service installed!${NC}"

echo -e "${YELLOW}Step 4: Building Frontend...${NC}"
cd $FRONTEND_DIR
npm install
npm run build
echo -e "${GREEN}Frontend build complete!${NC}"

echo -e "${YELLOW}Step 5: Installing Frontend service...${NC}"
if [ "$FRONTEND_DIR" = "frontend" ]; then
    cd ..
fi
sudo cp urbandeck-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable urbandeck-frontend
sudo systemctl restart urbandeck-frontend
echo -e "${GREEN}Frontend service installed!${NC}"

echo -e "${YELLOW}Step 6: Configuring Nginx...${NC}"
sudo cp nginx.conf /etc/nginx/sites-available/urbandeck

# Only create symlink if it doesn't exist
if [ ! -L /etc/nginx/sites-enabled/urbandeck ]; then
    sudo ln -s /etc/nginx/sites-available/urbandeck /etc/nginx/sites-enabled/
fi

# Test nginx config
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo -e "${GREEN}Nginx configured successfully!${NC}"
else
    echo -e "${RED}Nginx configuration error! Please check nginx.conf${NC}"
    exit 1
fi

echo ""
echo "=================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=================================="
echo ""
echo "Service Status:"
echo "---------------"
sudo systemctl status urbandeck-backend --no-pager -l | head -n 5
echo ""
sudo systemctl status urbandeck-frontend --no-pager -l | head -n 5
echo ""
echo "Quick Commands:"
echo "---------------"
echo "Backend logs:  sudo journalctl -u urbandeck-backend -f"
echo "Frontend logs: sudo journalctl -u urbandeck-frontend -f"
echo "Restart backend:  sudo systemctl restart urbandeck-backend"
echo "Restart frontend: sudo systemctl restart urbandeck-frontend"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update nginx.conf with your domain name"
echo "2. Setup SSL certificate: sudo certbot --nginx -d yourdomain.com"
echo "3. Update .env.production with your API keys"
echo "4. Test your application at https://yourdomain.com"
echo ""
