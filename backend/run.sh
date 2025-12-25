#!/bin/bash

# Digital Frames Shop Backend Startup Script
# This script ensures the backend runs with correct configuration for MySQL and Email

echo "Starting Digital Frames Shop Backend..."

# Kill any existing Spring Boot processes
echo "Stopping any existing backend processes..."
pkill -f "spring-boot:run" 2>/dev/null
pkill -f "DigitalFramesShop" 2>/dev/null
sleep 2

# IMPORTANT: Force default profile and correct email settings
export SPRING_PROFILES_ACTIVE=default
export SPRING_APPLICATION_JSON='{"spring.profiles.active":"default"}'

# Email configuration - MUST use urbandec.in@gmail.com with App Password
export MAIL_USERNAME="urbandec.in@gmail.com"
export MAIL_PASSWORD="zjij kiuf yxfl gypd"
export MAIL_HOST="smtp.gmail.com"
export MAIL_PORT=587
export MAIL_ENABLED=true
export spring_mail_username="urbandec.in@gmail.com"
export spring_mail_password="zjij kiuf yxfl gypd"

# Database configuration (using defaults from application.yml)
export DB_USERNAME="digitalframes_user"
export DB_PASSWORD="DF@Shop2024!Secure"

# Frontend URL for emails
export FRONTEND_URL="http://localhost:3000"

echo "Configuration:"
echo "  Profile: $SPRING_PROFILES_ACTIVE (forced)"
echo "  Email: $MAIL_USERNAME"
echo "  Database User: $DB_USERNAME"
echo "  Frontend URL: $FRONTEND_URL"

# Clean and compile
echo "Cleaning and compiling..."
./mvnw clean compile

# Run the application with explicit profile
echo "Starting Spring Boot application..."
./mvnw spring-boot:run -Dspring-boot.run.profiles=default -Dspring-boot.run.arguments="--spring.profiles.active=default --spring.mail.username=urbandec.in@gmail.com --spring.mail.password='zjij kiuf yxfl gypd'"