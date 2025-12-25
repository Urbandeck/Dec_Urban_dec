#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[ℹ]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

# Function to kill processes
kill_processes() {
    local process_name=$1
    local display_name=$2

    if pgrep -f "$process_name" > /dev/null 2>&1; then
        print_warning "Killing existing $display_name processes..."
        pkill -f "$process_name" 2>/dev/null
        sleep 2

        # Force kill if still running
        if pgrep -f "$process_name" > /dev/null 2>&1; then
            pkill -9 -f "$process_name" 2>/dev/null
            sleep 1
        fi

        print_status "$display_name processes killed"
    else
        print_info "No $display_name processes running"
    fi
}

# Main script starts here
echo "==========================================="
echo "   Digital Frames Shop - Application Runner"
echo "==========================================="
echo ""

# Step 1: Kill any existing backend processes
print_info "Checking for running backend processes..."
kill_processes "spring-boot:run" "Spring Boot"
kill_processes "mvnw" "Maven Wrapper"
kill_processes "java.*digitalframes" "Backend Java"
kill_processes "java.*shop-1.0.0.jar" "Backend JAR"

# Kill processes on port 8080
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Killing process on port 8080..."
    lsof -Pi :8080 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null
    sleep 1
    print_status "Port 8080 cleared"
fi

# Step 2: Kill any existing frontend processes
print_info "Checking for running frontend processes..."
kill_processes "next-server" "Next.js"
kill_processes "node.*next" "Next.js Node"
kill_processes "node.*3000" "Frontend on port 3000"

# Kill processes on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Killing process on port 3000..."
    lsof -Pi :3000 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null
    sleep 1
    print_status "Port 3000 cleared"
fi

echo ""
print_status "All existing processes cleaned up"
echo ""

# Step 3: Set up environment variables
print_info "Setting up environment..."
export DB_USERNAME="${DB_USERNAME:-ajaypatil}"
export DB_PASSWORD="${DB_PASSWORD:-}"
export DB_NAME="${DB_NAME:-digitalframes_shop}"
export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-5432}"
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"

# Load environment from .env file if it exists
if [ -f .env ]; then
    print_info "Loading environment from .env file..."
    export $(grep -v '^#' .env | xargs)
fi

# Step 4: Check and Start PostgreSQL if needed
print_info "Checking PostgreSQL status..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL is not installed"
    print_info "Installing PostgreSQL..."
    brew install postgresql@15
    if [ $? -eq 0 ]; then
        print_status "PostgreSQL installed successfully"
    else
        print_error "Failed to install PostgreSQL"
        print_info "Please install PostgreSQL manually: brew install postgresql@15"
        exit 1
    fi
fi

# Check if PostgreSQL service is running
if ! pgrep -x "postgres" > /dev/null 2>&1; then
    print_warning "PostgreSQL is not running"
    print_info "Starting PostgreSQL service..."

    # Try to start PostgreSQL using brew services
    brew services start postgresql@15 2>/dev/null || brew services start postgresql 2>/dev/null

    # Wait for PostgreSQL to start
    print_info "Waiting for PostgreSQL to start..."
    for i in {1..10}; do
        if pgrep -x "postgres" > /dev/null 2>&1; then
            print_status "PostgreSQL service started successfully"
            sleep 2  # Give it a moment to fully initialize
            break
        fi
        if [ $i -eq 10 ]; then
            print_error "PostgreSQL failed to start"
            print_info "Trying alternative start method..."

            # Try alternative PostgreSQL start command
            pg_ctl -D /opt/homebrew/var/postgresql@15 start 2>/dev/null || pg_ctl -D /opt/homebrew/var/postgres start 2>/dev/null
            sleep 3

            if ! pgrep -x "postgres" > /dev/null 2>&1; then
                print_error "Could not start PostgreSQL service"
                print_info "Please start PostgreSQL manually: brew services start postgresql@15"
                exit 1
            fi
        fi
        sleep 1
        echo -n "."
    done
    echo ""
else
    print_status "PostgreSQL service is already running"
fi

# Step 5: Setup PostgreSQL database (if PostgreSQL is accessible)
print_info "Checking PostgreSQL connection..."
if psql -U ${DB_USERNAME} -d postgres -c "SELECT 1" >/dev/null 2>&1; then
    print_status "PostgreSQL connection successful"

    # Setup PostgreSQL database
    print_info "Setting up PostgreSQL database..."
    psql -U ${DB_USERNAME} -d postgres -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null

    if [ $? -eq 0 ]; then
        print_status "Database created successfully"
    else
        print_info "Database may already exist (continuing anyway)"
    fi
else
    print_warning "Cannot connect to PostgreSQL"
    print_info "Trying to create database as current user..."
    createdb ${DB_NAME} 2>/dev/null || print_info "Database may already exist"
fi

# Step 6: Check Java installation
print_info "Checking Java installation..."
if ! java -version >/dev/null 2>&1; then
    print_error "Java is not installed"
    print_info "Installing Java 17..."
    brew install openjdk@17
    if [ $? -ne 0 ]; then
        print_error "Failed to install Java"
        exit 1
    fi
fi
print_status "Java is available"

# Step 7: Start Backend
echo ""
echo "==========================================="
echo "   Starting Backend Server"
echo "==========================================="
print_info "Starting Spring Boot backend on port 8080..."

cd backend
if [ ! -f "mvnw" ]; then
    print_error "Maven wrapper not found in backend directory"
    exit 1
fi

# Make mvnw executable
chmod +x mvnw

# Clean and start the backend in background
./mvnw clean compile spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start (check if port 8080 is listening)
print_info "Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:8080/actuator/health >/dev/null 2>&1 || lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_status "Backend started successfully (PID: $BACKEND_PID)"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend failed to start within 30 seconds"
        print_info "Check backend.log for details"
        exit 1
    fi
    sleep 1
    echo -n "."
done
echo ""

# Step 8: Start Frontend
echo ""
echo "==========================================="
echo "   Starting Frontend Server"
echo "==========================================="
print_info "Starting Next.js frontend on port 3000..."

cd frontend
if [ ! -d "node_modules" ]; then
    print_info "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
fi

# Start the frontend in background
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start (check if port 3000 is listening)
print_info "Waiting for frontend to start..."
for i in {1..20}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1 || lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_status "Frontend started successfully (PID: $FRONTEND_PID)"
        break
    fi
    if [ $i -eq 20 ]; then
        print_error "Frontend failed to start within 20 seconds"
        print_info "Check frontend.log for details"
        exit 1
    fi
    sleep 1
    echo -n "."
done
echo ""

# Step 9: Final status
echo ""
echo "==========================================="
echo "   Application Status"
echo "==========================================="
print_status "Backend running on: http://localhost:8080"
print_status "Frontend running on: http://localhost:3000"
print_status "Backend PID: $BACKEND_PID"
print_status "Frontend PID: $FRONTEND_PID"
echo ""
print_info "Logs available at:"
print_info "  - Backend: backend.log"
print_info "  - Frontend: frontend.log"
echo ""
print_info "To stop all services, press Ctrl+C or run:"
print_info "  pkill -f spring-boot:run && pkill -f 'next-server'"
echo ""
echo "==========================================="
print_status "Application is ready! Open http://localhost:3000"
echo "==========================================="

# Function to handle cleanup on exit
cleanup() {
    echo ""
    print_warning "Shutting down services..."

    # Kill backend
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        print_status "Backend stopped"
    fi

    # Kill frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        print_status "Frontend stopped"
    fi

    # Extra cleanup
    pkill -f "spring-boot:run" 2>/dev/null
    pkill -f "next-server" 2>/dev/null

    print_status "All services stopped"
    exit 0
}

# Set up trap to handle Ctrl+C
trap cleanup INT TERM

# Keep script running and monitor processes
while true; do
    # Check if backend is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_error "Backend process died unexpectedly"
        print_info "Check backend.log for details"
        cleanup
    fi

    # Check if frontend is still running
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_error "Frontend process died unexpectedly"
        print_info "Check frontend.log for details"
        cleanup
    fi

    sleep 5
done