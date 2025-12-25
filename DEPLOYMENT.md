# UrbanDeck Deployment Guide - Hostinger VPS

Complete step-by-step guide to deploy your UrbanDeck e-commerce platform on Hostinger VPS.

## Prerequisites

- Hostinger VPS (KVM 1 or higher recommended)
- Domain name pointed to your VPS IP
- SSH access to your VPS
- Git installed locally

## Step 1: Initial Server Setup

### 1.1 Connect to your VPS

```bash
ssh root@your-vps-ip
```

### 1.2 Create a new user (recommended for security)

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### 1.3 Upload and run the deployment script

On your VPS, run:

```bash
# Download the deployment script
wget https://raw.githubusercontent.com/yourusername/yourrepo/main/deploy-vps.sh
# Or copy the deploy-vps.sh file from your project

chmod +x deploy-vps.sh
./deploy-vps.sh
```

This will install:
- Java 17
- Node.js 18
- MySQL 8.0
- Nginx
- PM2
- Maven

## Step 2: Upload Your Application Code

### Option A: Using Git (Recommended)

```bash
cd /var/www/urbandeck
git clone https://github.com/yourusername/digital-frames-shop.git .
```

### Option B: Using SCP from your local machine

```bash
# From your local machine
scp -r /path/to/digital-frames-shop deploy@your-vps-ip:/var/www/urbandeck
```

### Option C: Using SFTP client
Use FileZilla or WinSCP to upload files to `/var/www/urbandeck`

## Step 3: Configure Environment Variables

### 3.1 Update production environment file

```bash
cd /var/www/urbandeck
nano .env.production
```

Update with your actual values:
- Database credentials
- Razorpay API keys
- Twilio credentials
- Email settings
- Your domain name

### 3.2 Create application-prod.yml for Spring Boot

```bash
cd /var/www/urbandeck/backend/src/main/resources
cp application.yml application-prod.yml
nano application-prod.yml
```

Update database URL to use environment variables:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/digitalframes_shop
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

cors:
  allowed-origins: https://yourdomain.com
```

## Step 4: Build and Deploy Backend

### 4.1 Build the Spring Boot application

```bash
cd /var/www/urbandeck/backend
./mvnw clean package -DskipTests
```

This creates: `target/shop-1.0.0.jar`

### 4.2 Create log directory

```bash
sudo mkdir -p /var/log/urbandeck
sudo chown -R www-data:www-data /var/log/urbandeck
```

### 4.3 Install systemd service

```bash
sudo cp /var/www/urbandeck/urbandeck-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable urbandeck-backend
sudo systemctl start urbandeck-backend
```

### 4.4 Check backend status

```bash
sudo systemctl status urbandeck-backend
sudo journalctl -u urbandeck-backend -f
```

## Step 5: Build and Deploy Frontend

### 5.1 Install dependencies

```bash
cd /var/www/urbandeck/frontend
npm install
```

### 5.2 Create .env.local for production

```bash
nano .env.local
```

Add:
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NODE_ENV=production
```

### 5.3 Build Next.js application

```bash
npm run build
```

### 5.4 Install systemd service

```bash
sudo cp /var/www/urbandeck/urbandeck-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable urbandeck-frontend
sudo systemctl start urbandeck-frontend
```

### 5.5 Check frontend status

```bash
sudo systemctl status urbandeck-frontend
sudo journalctl -u urbandeck-frontend -f
```

## Step 6: Configure Nginx

### 6.1 Copy Nginx configuration

```bash
sudo cp /var/www/urbandeck/nginx.conf /etc/nginx/sites-available/urbandeck
```

### 6.2 Edit the configuration

```bash
sudo nano /etc/nginx/sites-available/urbandeck
```

Replace `yourdomain.com` with your actual domain.

### 6.3 Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/urbandeck /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
```

### 6.4 Test and reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 7: Setup SSL Certificate (Let's Encrypt)

### 7.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts and select option to redirect HTTP to HTTPS.

### 7.3 Test auto-renewal

```bash
sudo certbot renew --dry-run
```

## Step 8: Configure MySQL Database

### 8.1 Secure MySQL installation

```bash
sudo mysql_secure_installation
```

### 8.2 Verify database and user

```bash
sudo mysql -u root -p
```

```sql
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User='digitalframes_user';
EXIT;
```

## Step 9: Final Checks

### 9.1 Check all services are running

```bash
sudo systemctl status urbandeck-backend
sudo systemctl status urbandeck-frontend
sudo systemctl status nginx
sudo systemctl status mysql
```

### 9.2 Check application logs

```bash
# Backend logs
sudo tail -f /var/log/urbandeck/backend.log

# Frontend logs
sudo tail -f /var/log/urbandeck/frontend.log

# Nginx logs
sudo tail -f /var/log/nginx/urbandeck-access.log
```

### 9.3 Test your application

Visit: `https://yourdomain.com`

Test:
- Homepage loads
- User registration
- User login
- Product browsing
- Add to cart
- Checkout process (with test Razorpay keys)

## Step 10: Monitoring and Maintenance

### 10.1 Setup monitoring (optional)

```bash
# Install Netdata for server monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

### 10.2 Regular maintenance commands

```bash
# Restart backend
sudo systemctl restart urbandeck-backend

# Restart frontend
sudo systemctl restart urbandeck-frontend

# View real-time logs
sudo journalctl -u urbandeck-backend -f
sudo journalctl -u urbandeck-frontend -f

# Update application
cd /var/www/urbandeck
git pull
cd backend && ./mvnw clean package
sudo systemctl restart urbandeck-backend
cd ../frontend && npm run build
sudo systemctl restart urbandeck-frontend
```

## Troubleshooting

### Backend not starting

```bash
# Check logs
sudo journalctl -u urbandeck-backend -n 100

# Common issues:
# - Database connection: Check MySQL is running and credentials
# - Port 8080 in use: Check with `sudo lsof -i :8080`
# - Java version: Verify with `java -version`
```

### Frontend not starting

```bash
# Check logs
sudo journalctl -u urbandeck-frontend -n 100

# Common issues:
# - Dependencies: Run `npm install` again
# - Port 3000 in use: Check with `sudo lsof -i :3000`
# - Build errors: Run `npm run build` manually to see errors
```

### Nginx 502 Bad Gateway

```bash
# Check if backend/frontend are running
curl http://localhost:8080/actuator/health
curl http://localhost:3000

# Check Nginx error logs
sudo tail -f /var/log/nginx/urbandeck-error.log
```

### Database connection issues

```bash
# Test MySQL connection
mysql -u digitalframes_user -p digitalframes_shop

# Check MySQL is running
sudo systemctl status mysql

# Reset password if needed
sudo mysql -u root -p
ALTER USER 'digitalframes_user'@'localhost' IDENTIFIED BY 'NewPassword123!';
FLUSH PRIVILEGES;
```

## Security Recommendations

1. **Firewall**: Only allow necessary ports (22, 80, 443)
2. **SSH**: Disable root login, use key-based authentication
3. **Database**: Use strong passwords, don't expose MySQL port externally
4. **SSL**: Always use HTTPS in production
5. **Updates**: Regularly update system packages
6. **Backups**: Setup automated database backups

### Setup automated backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-db.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mysqldump -u digitalframes_user -p'DF@Shop2024!Secure' digitalframes_shop > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -mtime +7 -delete  # Keep only 7 days of backups
```

```bash
sudo chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
```

Add line:
```
0 2 * * * /usr/local/bin/backup-db.sh
```

## Performance Optimization

### 1. Enable MySQL query cache

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Add under `[mysqld]`:
```ini
query_cache_type = 1
query_cache_size = 64M
innodb_buffer_pool_size = 512M
```

### 2. Optimize Next.js

Ensure your `next.config.js` has:
```javascript
module.exports = {
  output: 'standalone',
  compress: true,
  productionBrowserSourceMaps: false,
}
```

### 3. Enable Nginx caching

Already configured in the provided `nginx.conf`

## Support

For issues:
1. Check logs first
2. Verify all services are running
3. Test each component individually
4. Review security groups/firewall rules

## Updates and Redeployment

When you make code changes:

```bash
# SSH into VPS
ssh deploy@your-vps-ip

# Pull latest code
cd /var/www/urbandeck
git pull

# Update backend
cd backend
./mvnw clean package -DskipTests
sudo systemctl restart urbandeck-backend

# Update frontend
cd ../frontend
npm install  # Only if package.json changed
npm run build
sudo systemctl restart urbandeck-frontend

# Check status
sudo systemctl status urbandeck-backend
sudo systemctl status urbandeck-frontend
```

## Estimated Costs

- Hostinger VPS KVM 1: ~$5.99/month
- Domain name: ~$10/year
- SSL Certificate: Free (Let's Encrypt)

**Total: ~$6-7/month**

---

Your UrbanDeck e-commerce platform should now be live at https://yourdomain.com!
