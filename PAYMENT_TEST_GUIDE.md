# Payment Testing Guide - Digital Frames Shop

## Razorpay Test Mode Testing

### Test Card Numbers

#### Successful Payment Cards
- **Card Number:** 4111 1111 1111 1111 (Visa)
- **Card Number:** 5104 0600 0000 0008 (Mastercard)
- **Expiry:** Any future date (e.g., 12/25)
- **CVV:** Any 3 digits (e.g., 123)
- **OTP (if asked):** Leave empty or use any value

#### Failed Payment Test Cases

##### 1. Insufficient Balance
- **Card Number:** 4111 1111 1111 1111
- **Action:** Click "Failure" on the test payment page
- **Expected Result:** Payment fails with "Card has insufficient balance" error

##### 2. Card Declined
- **Card Number:** 5104 0155 5555 5558
- **Expiry:** Any future date
- **CVV:** Any 3 digits
- **Expected Result:** Payment fails with "Card declined by bank" error

##### 3. Invalid CVV
- **Card Number:** 4111 1111 1111 1111
- **CVV:** Enter wrong CVV when prompted in test mode
- **Expected Result:** Payment fails with authentication error

##### 4. Network Error
- **Card Number:** 5104 0600 0000 0008
- **Action:** Click "Failure" when test payment screen appears
- **Expected Result:** Payment fails with network/processing error

### How to Test Different Scenarios

#### Test Successful Payment:
1. Go to checkout page with items in cart
2. Fill in all required address fields
3. Click "Proceed to Payment"
4. Enter test card: 4111 1111 1111 1111
5. Enter any future expiry (12/25) and CVV (123)
6. Click "Success" on the test payment screen
7. Verify: Loading overlay appears → Order is created → Redirected to orders page

#### Test Failed Payment:
1. Go to checkout page with items in cart
2. Fill in all required address fields
3. Click "Proceed to Payment"
4. Enter test card: 4111 1111 1111 1111
5. Enter any future expiry (12/25) and CVV (123)
6. Click "Failure" on the test payment screen
7. Verify: Error message appears → Cart items are retained → Can retry payment

#### Test Payment Cancellation:
1. Start checkout process
2. When Razorpay modal opens, click the X or press ESC
3. Verify: Returns to checkout page → Cart items retained → Can retry

### UPI Test IDs (for UPI testing)
- **Success:** success@razorpay
- **Failure:** failure@razorpay

### Netbanking Test
1. Select Netbanking option
2. Choose any bank
3. Click "Success" for successful payment
4. Click "Failure" for failed payment

### Wallet Test
- **Success:** Use any test phone number with OTP 123456
- **Failure:** Use any test phone number and click "Failure"

## Testing Checklist

### Pre-Payment
- [ ] Cart has items
- [ ] User is logged in (or guest checkout)
- [ ] Address fields are validated
- [ ] Payment button is enabled

### During Payment
- [ ] Razorpay modal opens correctly
- [ ] Prefilled data is correct (name, email, phone)
- [ ] Can switch between payment methods
- [ ] Can cancel payment (X button or ESC)

### Post-Payment Success
- [ ] Success loading overlay appears
- [ ] "Payment Successful!" message shows
- [ ] Order is created in backend
- [ ] Order saved to localStorage (backup)
- [ ] Cart is cleared
- [ ] Redirected to orders page
- [ ] Order appears in order history

### Post-Payment Failure
- [ ] Error message displayed
- [ ] Cart items are retained
- [ ] Can retry payment
- [ ] Form data is preserved
- [ ] No duplicate orders created

## Common Issues and Solutions

### Issue: Payment succeeds but order not created
**Check:** Backend server is running on port 8080
**Check:** Database connection is active
**Solution:** Order will be saved to localStorage as backup

### Issue: Razorpay modal doesn't open
**Check:** Razorpay keys are configured correctly
**Check:** Internet connection for loading Razorpay SDK
**Solution:** Check browser console for errors

### Issue: Payment fails silently
**Check:** Browser console for errors
**Check:** Network tab for failed API calls
**Solution:** Ensure all required fields are filled

## Environment Variables Required
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RNNL8f3yxCGLmF
RAZORPAY_KEY_SECRET=WbMLH3S3EHmzqkdWUG7CstsD
```

## Backend Endpoints
- Create Order: `POST /api/orders`
- Get Orders: `GET /api/orders`
- Get Order by ID: `GET /api/orders/{orderId}`

## Support Resources
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Razorpay Test Mode](https://razorpay.com/docs/payments/dashboard/settings/api-keys/#test-mode)