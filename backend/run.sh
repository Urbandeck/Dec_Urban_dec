#!/bin/bash

# Digital Frames Shop Backend Startup Script
# Local Development with PostgreSQL

echo "Starting Digital Frames Shop Backend (Local PostgreSQL)..."

# Kill any existing Spring Boot processes
echo "Stopping any existing backend processes..."
pkill -f "spring-boot:run" 2>/dev/null
pkill -f "DigitalFramesShop" 2>/dev/null
sleep 2

# IMPORTANT: Unset any conflicting environment variables
unset SPRING_PROFILES_ACTIVE
unset SPRING_APPLICATION_JSON

# Database configuration for local PostgreSQL
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=digitalframes_shop
export DB_USERNAME=ajaypatil
export DB_PASSWORD=""

# Email configuration (optional for local dev)
export MAIL_USERNAME="urbandec.in@gmail.com"
export MAIL_PASSWORD="zjij kiuf yxfl gypd"
export MAIL_HOST="smtp.gmail.com"
export MAIL_PORT=587
export MAIL_ENABLED=false

# Frontend URL for emails
export FRONTEND_URL="http://localhost:3000"

echo "Configuration:"
echo "  Profile: default (PostgreSQL)"
echo "  Database: postgresql://localhost:5432/digitalframes_shop"
echo "  Database User: $DB_USERNAME"
echo "  Frontend URL: $FRONTEND_URL"
echo "  Mail Enabled: $MAIL_ENABLED"

# Clean and compile
echo "Cleaning and compiling..."
./mvnw clean compile

# Run the application with explicit default profile
echo "Starting Spring Boot application..."
./mvnw spring-boot:run -Dspring-boot.run.profiles=default -Dspring.profiles.active=default