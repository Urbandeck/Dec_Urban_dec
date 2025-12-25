# Backend Startup Guide

## Quick Start

### Production Mode (with Email)
```bash
./run.sh
```
- Sends real OTP emails via Gmail SMTP
- Uses `urbandec.in@gmail.com` account
- Requires internet connection

### Development Mode (without Email)
```bash
./run-dev.sh
```
- OTP codes are logged to console only
- No emails sent
- Good for local development

## Configuration

### Email Settings (Production)
- **Email:** urbandec.in@gmail.com
- **App Password:** zjij kiuf yxfl gypd
- **SMTP Host:** smtp.gmail.com
- **Port:** 587

### Database Settings
- **Database:** digitalframes_shop
- **Username:** digitalframes_user
- **Password:** DF@Shop2024!Secure
- **URL:** localhost:3306

## Manual Start

If you need to run with custom settings:

```bash
# With email enabled
MAIL_USERNAME="urbandec.in@gmail.com" \
MAIL_PASSWORD="zjij kiuf yxfl gypd" \
MAIL_ENABLED=true \
./mvnw spring-boot:run

# Without email (dev mode)
MAIL_ENABLED=false \
./mvnw spring-boot:run
```

## Troubleshooting

### Email not sending?
1. Check internet connection
2. Verify App Password is still valid
3. Check logs: `tail -f backend.log`

### Wrong email being used?
- Make sure no other Spring Boot instance is running
- Kill all Java processes: `pkill -f "spring-boot:run"`
- Restart using `./run.sh`

### OTP Rate Limiting
- Users must wait 60 seconds between OTP requests
- OTPs expire after 10 minutes

## Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@urbandeck.com | Admin@2024! | ADMIN |
| customer@urbandeck.com | Demo123! | USER |