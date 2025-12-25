# Railway Deployment Guide for UrbanDeck Backend

## Current Status
✅ Frontend deployed to Vercel: https://frontend-tawny-psi-67.vercel.app
⏳ Backend needs to be deployed to Railway

## Step-by-Step Railway Deployment

### 1. Create New Project
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: **Urbandeck/Dec_Urban_dec**
5. Select the `main` branch

### 2. Add MySQL Database
1. In your Railway project, click "New"
2. Select "Database" → "MySQL"
3. Railway will provision a MySQL database
4. Note the connection details (they'll be auto-added as environment variables)

### 3. Configure Environment Variables
In Railway project settings → Variables, add:

```
# Database (Railway will auto-provide MYSQL_URL, but you need these)
DB_HOST=${MYSQL_HOST}
DB_PORT=${MYSQL_PORT}
DB_NAME=${MYSQL_DATABASE}
DB_USERNAME=${MYSQL_USER}
DB_PASSWORD=${MYSQL_PASSWORD}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}

# JWT Security
JWT_SECRET=dF$hop2024SecureJWT!Key@256BitLongSecretForAuthentication#Prod
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000

# Razorpay
RAZORPAY_KEY_ID=rzp_test_RNNL8f3yxCGLmF
RAZORPAY_KEY_SECRET=WbMLH3S3EHmzqkdWUG7CstsD
RAZORPAY_WEBHOOK_SECRET=webhook_secret_DF2024_secure@123

# Email (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=urbandec.in@gmail.com
MAIL_PASSWORD=zjij kiuf yxfl gypd

# Frontend URL (Vercel URL)
FRONTEND_URL=https://frontend-tawny-psi-67.vercel.app

# Spring Profile
SPRING_PROFILES_ACTIVE=mysql

# Shiprocket
SHIPROCKET_EMAIL=patilajayv2200@gmail.com
SHIPROCKET_PASSWORD=nwpE9I!!1uhp6S4$
SHIPROCKET_PICKUP_LOCATION=work
SHIPROCKET_CHANNEL_ID=8362554

# Server Port (Railway provides this)
PORT=${PORT}
```

### 4. Configure Build Settings
Railway should auto-detect the configuration from `railway.toml`, but verify:

**Root Directory**: `/` (project root)
**Build Command**: `cd backend && ./mvnw clean package -DskipTests`
**Start Command**: `cd backend && java -Dserver.port=$PORT -jar target/*.jar`

### 5. Deploy
1. Click "Deploy"
2. Wait for build to complete (may take 5-10 minutes)
3. Once deployed, Railway will provide a URL like: `https://your-app.railway.app`

### 6. Update Vercel Environment Variables
After Railway deployment:
1. Go to https://vercel.com/urbandecs-projects/frontend
2. Go to Settings → Environment Variables
3. Add/Update:
   - `NEXT_PUBLIC_API_URL` = Your Railway backend URL
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` = `rzp_test_RNNL8f3yxCGLmF`
4. Redeploy frontend

## Troubleshooting

### Build Fails
- Check logs in Railway dashboard
- Ensure Java 17+ is being used
- Verify all environment variables are set

### Database Connection Issues
- Ensure MySQL service is running in Railway
- Check that DB_HOST, DB_PORT match Railway's MySQL service
- Verify database credentials

### Health Check Fails
- Check `/api/health` endpoint
- Increase healthcheck timeout in railway.toml

## Alternative: Manual Railway CLI Deployment
If you get a new working token:
```bash
export RAILWAY_TOKEN=your-new-token
railway login
railway init
railway link
railway up
```

## Next Steps After Deployment
1. Get Railway backend URL
2. Update Vercel environment variables
3. Test the full application
4. Update CORS settings in backend if needed
