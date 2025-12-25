# Digital Frames E-commerce Platform

A modern, minimalist e-commerce platform for digital photo frames built with React, Spring Boot, and Razorpay payment integration.

## 🚀 Features

- **Product Catalog**: Browse digital frames with filters (size, orientation, price)
- **Shopping Cart**: Add/update/remove items with real-time price calculation
- **Secure Checkout**: Address management and Razorpay payment integration
- **User Authentication**: JWT-based auth with refresh tokens
- **Admin Dashboard**: Manage products, orders, and inventory
- **Responsive Design**: Minimalist UI with TailwindCSS

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for fast development
- Redux Toolkit + RTK Query for state management
- TailwindCSS for styling
- React Router v6 for routing
- React Hook Form + Zod for forms

### Backend
- Java 17 + Spring Boot 3.x
- Spring Security with JWT authentication
- PostgreSQL database
- Flyway for database migrations
- Razorpay SDK for payments

## 📁 Project Structure

```
digital-frames-shop/
├── backend/                 # Spring Boot API
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Configuration files
│   └── pom.xml             # Maven dependencies
├── frontend/               # React application  
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   └── package.json       # NPM dependencies
├── docker-compose.yml     # Docker orchestration
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd digital-frames-shop

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080
# Database: localhost:5432
```

### Manual Setup

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Set environment variables
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=your-secret-key
export RAZORPAY_KEY_ID=your-razorpay-key
export RAZORPAY_KEY_SECRET=your-razorpay-secret

# Run the application
./mvnw spring-boot:run
```

#### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔐 Environment Variables

### Backend (.env or application.yml)
```yaml
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-jwt-secret
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/{slug}` - Get product details

### Cart & Checkout
- `POST /api/checkout/preview` - Calculate order totals
- `POST /api/checkout/place` - Place order

### Payments
- `POST /api/payments/razorpay/order` - Create Razorpay order
- `POST /api/payments/razorpay/verify` - Verify payment

### Admin (Protected)
- `GET /api/admin/dashboard` - Dashboard stats
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📦 Production Build

### Backend
```bash
cd backend
./mvnw clean package
# JAR will be in target/shop-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
# Static files will be in dist/
```

## 🚢 Deployment

The application is ready for deployment on:
- **Heroku**: Use included Procfile
- **AWS EC2**: Use Docker Compose
- **Render**: Direct GitHub integration
- **DigitalOcean**: App Platform compatible

## 👤 Test Credentials

### Working Credentials (Use these to login):
- **Admin User**: admin@urbandeck.com / admin123 (Has ADMIN role)
- **Regular User**: customer@example.com / customer123 (Regular user)

Note: The admin@urbandeck.com user has full admin privileges and can access the admin pages.

## 📝 License

MIT License - feel free to use for commercial projects

## 🤝 Contributing

Pull requests are welcome! Please follow the existing code style.

## 📧 Support

For issues and questions, please open a GitHub issue.# newUrbanDec
# newUrbanDec
