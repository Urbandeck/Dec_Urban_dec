#!/bin/bash

# Digital Frames Shop Backend Development Mode
# This script runs backend in dev mode with email disabled (logs OTP to console)

echo "Starting Digital Frames Shop Backend in DEVELOPMENT MODE..."

# Set environment variables for development
export SPRING_PROFILES_ACTIVE=default
export MAIL_ENABLED=false  # Disables actual email sending, logs OTP to console
export MAIL_USERNAME="urbandec.in@gmail.com"
export MAIL_PASSWORD="zjij kiuf yxfl gypd"

# Database configuration
export DB_USERNAME="digitalframes_user"
export DB_PASSWORD="DF@Shop2024!Secure"

# Frontend URL
export FRONTEND_URL="http://localhost:3000"

echo "Configuration (DEV MODE):"
echo "  Profile: $SPRING_PROFILES_ACTIVE"
echo "  Email Sending: DISABLED (OTP will be logged to console)"
echo "  Database User: $DB_USERNAME"
echo "  Frontend URL: $FRONTEND_URL"

# Run the application
echo "Starting Spring Boot application..."
./mvnw spring-boot:run