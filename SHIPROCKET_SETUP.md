# Shiprocket Integration Setup Guide

## Current Configuration Status

### ✅ Already Configured
- **Email:** patilajayv2200@gmail.com
- **Password:** nwpE9I!!1uhp6S4$
- **Pickup Location:** Primary
- **API Base URL:** https://apiv2.shiprocket.in/v1/external

### ❌ Missing Configuration
- **Channel ID:** Not configured (empty)

## Required Steps to Complete Shiprocket Setup

### Step 1: Get Your Channel ID
1. Login to Shiprocket Dashboard: https://app.shiprocket.in/
2. Navigate to **Settings** → **API** → **Channel**
3. Create a new channel or use existing one
4. Copy the Channel ID

### Step 2: Update Configuration
Add the Channel ID to your `.env` file:
```env
SHIPROCKET_CHANNEL_ID=your_channel_id_here
```

### Step 3: Setup Pickup Location
1. Login to Shiprocket Dashboard
2. Go to **Settings** → **Pickup Addresses**
3. Add your pickup address:
   - Company Name: UrbanDeck
   - Contact Name: Your Name
   - Complete Address
   - Pincode
   - Phone Number
4. Mark it as "Primary" if it's your main location

### Step 4: Configure Product Details
Ensure your products have these required fields for shipping:
- Weight (in kg)
- Dimensions (length, width, height in cm)
- HSN code (for GST)

### Step 5: Test Integration
1. Create a test order
2. Check if Shiprocket order is created
3. Verify tracking details

## API Endpoints Available

### Backend Shiprocket Endpoints
- `POST /api/shiprocket/create-order` - Create shipping order
- `GET /api/shiprocket/track/{orderId}` - Track shipment
- `POST /api/shiprocket/generate-label` - Generate shipping label
- `POST /api/shiprocket/generate-manifest` - Generate manifest
- `GET /api/shiprocket/serviceability` - Check serviceability

## Environment Variables Required
```env
# Shiprocket Configuration
SHIPROCKET_EMAIL=patilajayv2200@gmail.com
SHIPROCKET_PASSWORD=nwpE9I!!1uhp6S4$
SHIPROCKET_PICKUP_LOCATION=Primary
SHIPROCKET_CHANNEL_ID=<YOUR_CHANNEL_ID>  # ⚠️ REQUIRED
SHIPROCKET_API_URL=https://apiv2.shiprocket.in/v1/external
```

## Testing Shiprocket Integration

### 1. Test Authentication
```bash
curl -X POST https://apiv2.shiprocket.in/v1/external/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patilajayv2200@gmail.com",
    "password": "nwpE9I!!1uhp6S4$"
  }'
```

### 2. Check Serviceability
After authentication, test if shipping is available for a pincode:
```bash
curl -X GET "https://apiv2.shiprocket.in/v1/external/courier/serviceability?pickup_postcode=YOUR_PICKUP_PINCODE&delivery_postcode=CUSTOMER_PINCODE&cod=0&weight=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Order Flow with Shiprocket

1. **Customer places order** → Order created in database
2. **Payment confirmed** → Trigger Shiprocket order creation
3. **Shiprocket order created** → Get AWB (Airway Bill) number
4. **Schedule pickup** → Shiprocket assigns courier
5. **Generate label** → Print shipping label
6. **Ship product** → Hand over to courier
7. **Track shipment** → Customer can track using AWB

## Common Issues and Solutions

### Issue: Channel ID not found
**Solution:** Create a channel in Shiprocket dashboard and update .env

### Issue: Pickup location not found
**Solution:** Add and verify pickup address in Shiprocket dashboard

### Issue: Authentication failed
**Solution:** Verify email and password in Shiprocket account

### Issue: Serviceability check fails
**Solution:** Ensure pickup and delivery pincodes are serviceable

## Important Notes

1. **Test Mode:** Shiprocket doesn't have a test mode. Use small value orders for testing
2. **Weight:** Minimum weight is 0.5 kg for most couriers
3. **COD:** Cash on Delivery needs to be enabled separately
4. **Returns:** Return shipping needs separate configuration

## Next Steps

1. ✅ Login to Shiprocket and get Channel ID
2. ✅ Update .env file with Channel ID
3. ✅ Add pickup location in Shiprocket
4. ✅ Test order creation with a sample order
5. ✅ Verify shipping rates and serviceability

## Support Resources

- Shiprocket API Docs: https://apidocs.shiprocket.in/
- Shiprocket Support: support@shiprocket.in
- Dashboard: https://app.shiprocket.in/