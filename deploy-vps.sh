#!/bin/bash

# UrbanDeck Deployment Script for Hostinger VPS
# Run this script on your VPS server

set -e

echo "=================================="
echo "UrbanDeck VPS Deployment Setup"
echo "=================================="

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Java 17
echo "Installing Java 17..."
sudo apt install -y openjdk-17-jdk

# Install Node.js 18
echo "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
echo "Installing MySQL..."
sudo apt install -y mysql-server

# Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# Install PM2 for Node.js process management
echo "Installing PM2..."
sudo npm install -g pm2

# Install Maven
echo "Installing Maven..."
sudo apt install -y maven

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /var/www/urbandeck
sudo chown -R $USER:$USER /var/www/urbandeck

# Setup MySQL
echo "Setting up MySQL database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS digitalframes_shop;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'digitalframes_user'@'localhost' IDENTIFIED BY 'DF@Shop2024!Secure';"
sudo mysql -e "GRANT ALL PRIVILEGES ON digitalframes_shop.* TO 'digitalframes_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Setup firewall
echo "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw --force enable

echo "=================================="
echo "Basic setup completed!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Upload your application code to /var/www/urbandeck"
echo "2. Configure environment variables"
echo "3. Build and deploy backend"
echo "4. Build and deploy frontend"
echo "5. Configure Nginx"
echo ""
