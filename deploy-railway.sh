#!/bin/bash
set -e

echo "🚀 Starting Railway Backend Deployment..."

# Navigate to project directory
cd /Users/ajaypatil/Documents/UrbanDeck/digital-frames-shop

# Deploy the backend
echo "📦 Deploying backend to Railway..."
railway up

echo ""
echo "✅ Backend deployed!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Add MySQL Database:"
echo "   - Go to: https://railway.com/project/654fe7fe-35eb-49d5-91a4-5d401232d2ef"
echo "   - Click 'New' → 'Database' → 'Add MySQL'"
echo ""
echo "2. Set Environment Variables in Railway Dashboard:"
echo "   Copy and paste these in Settings → Variables:"
echo ""
cat << 'EOF'
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_USERNAME=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
MYSQL_ROOT_PASSWORD=${{MySQL.MYSQL_ROOT_PASSWORD}}
JWT_SECRET=dF$hop2024SecureJWT!Key@256BitLongSecretForAuthentication#Prod
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000
RAZORPAY_KEY_ID=rzp_test_RNNL8f3yxCGLmF
RAZORPAY_KEY_SECRET=WbMLH3S3EHmzqkdWUG7CstsD
RAZORPAY_WEBHOOK_SECRET=webhook_secret_DF2024_secure@123
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=urbandec.in@gmail.com
MAIL_PASSWORD=zjij kiuf yxfl gypd
FRONTEND_URL=https://frontend-tawny-psi-67.vercel.app
SPRING_PROFILES_ACTIVE=mysql
SHIPROCKET_EMAIL=patilajayv2200@gmail.com
SHIPROCKET_PASSWORD=nwpE9I!!1uhp6S4$
SHIPROCKET_PICKUP_LOCATION=work
SHIPROCKET_CHANNEL_ID=8362554
EOF

echo ""
echo "3. After deployment completes, get your Railway URL and share it with me"
echo "   so I can update the Vercel frontend configuration."
echo ""
