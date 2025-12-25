# Application Context - Digital Frames Shop

## Recent Changes and Fixes

### Cart Image Display Issue (Fixed)

**Problem**: One of the product images in the cart was not visible when there were 2 products in the cart.

**Root Cause**:
- Inconsistent image URL formatting when adding products to cart
- The cart page expected base64 images to have the proper data URI prefix (`data:image/jpeg;base64,`)
- Products were being added with raw base64 data without the prefix

**Files Modified**:

1. **`/frontend/components/ProductActions.tsx`**
   - Lines 32-34: Fixed `handleAddToCart` to properly format base64 data with data URI prefix
   - Lines 56-58: Fixed `handleBuyNow` to use the same formatting
   - Changed from: `imageUrl: product.images?.[0]?.base64Data || '/images/placeholder.jpg'`
   - Changed to: `imageUrl: product.images?.[0]?.base64Data ? 'data:${product.images[0].mimeType || 'image/jpeg'};base64,${product.images[0].base64Data}' : '/images/placeholder.jpg'`

2. **`/frontend/components/AddToCartButton.tsx`**
   - Lines 23-40: Added logic to properly handle different image URL formats
   - Now checks if imageUrl is already formatted with data URI prefix
   - Falls back to base64 data with proper formatting if available
   - Uses placeholder image as last resort

**How Cart Images Work**:
- Cart displays images in `/frontend/app/cart/page.tsx` (lines 86-111)
- Cart checks if `item.imageUrl` starts with 'data:image' to display base64 images
- Falls back to placeholder SVG if image URL is not properly formatted

**Cart Data Structure** (`/frontend/store/cart.ts`):
```typescript
interface CartItem {
  productId: number
  skuId: number
  name: string
  price: number
  quantity: number
  imageUrl?: string  // Should contain either data URI or regular URL
  attributes?: string
}
```

## Key Components Overview

### Frontend Structure
- **Framework**: Next.js with TypeScript
- **State Management**: Zustand for cart state (`/frontend/store/cart.ts`)
- **Styling**: Tailwind CSS
- **Image Handling**: Supports both base64 data URIs and regular image URLs

### Product Image System
- Products can have multiple images stored with base64 data
- Images have metadata: `mimeType`, `base64Data`, `isPrimary`, `displayOrder`
- Primary image is used for cart display
- ImageSlideshow component displays all product images on detail page

### Cart System
- Persistent cart using Zustand with localStorage
- Cart items include product details and formatted image URLs
- Cart page shows product images, quantities, prices, and totals
- Supports quantity updates, item removal, and clearing cart

## Testing Notes
To verify the fix:
1. Add products to cart from product listing page
2. Add products to cart from product detail page
3. Check that all product images display correctly in cart
4. Verify images persist after page refresh (localStorage)

## Related Files for Reference
- `/frontend/lib/api.ts` - API interfaces and Product/ProductImage types
- `/frontend/components/ProductImage.tsx` - Reusable product image component
- `/frontend/app/products/[slug]/page.tsx` - Product detail page
- `/frontend/app/products/page.tsx` - Products listing page
- `/frontend/app/cart/page.tsx` - Shopping cart page
- `/frontend/components/ImageSlideshow.tsx` - Product image carousel

## User Credentials (Updated in Database)

**Admin User:**
- Email: admin@urbandeck.com
- Password: Admin@2024!
- Roles: ADMIN, USER

**Customer User:**
- Email: customer@urbandeck.com
2- Password: Demo123!
- Roles: USER

## Email OTP Verification Implementation (Latest)

**Feature**: Added email OTP verification during sign-up process for enhanced security.

**Backend Changes**:

1. **`OTP.java`** - Created OTP entity model with:
   - 6-digit OTP code generation
   - 10-minute expiry time
   - Support for SIGNUP, LOGIN, and PASSWORD_RESET types
   - Validation methods for checking expiry and usage

2. **`OTPRepository.java`** - Repository for OTP operations:
   - Finding valid OTPs
   - Deleting expired OTPs
   - Managing OTP lifecycle

3. **`OTPService.java`** - Service layer for OTP management:
   - Generates secure 6-digit OTP codes
   - Sends OTP via email service
   - Validates OTP with expiry check
   - Implements resend with 1-minute cooldown

4. **`UserRegistrationCache.java`** - Temporary storage for registration data:
   - Stores user data during OTP verification
   - 15-minute expiry for cached data
   - In-memory storage using ConcurrentHashMap

5. **`EmailService.java`** - Updated with sendEmail method:
   - Development mode logs OTP to console
   - Production mode sends actual emails
   - Configurable via MAIL_ENABLED environment variable

6. **`AuthController.java`** - New OTP endpoints:
   - `/api/auth/register` - Initiates registration and sends OTP
   - `/api/auth/verify-signup-otp` - Verifies OTP and completes registration
   - `/api/auth/resend-otp` - Resends OTP with rate limiting

**Frontend Changes**:

1. **`OTPVerification.tsx`** - Reusable OTP verification component:
   - 6-digit input with auto-focus navigation
   - Auto-submit on complete entry
   - Paste support for OTP codes
   - Resend timer with 60-second cooldown
   - Support for different verification types

2. **`register/page.tsx`** - Updated registration flow:
   - Collects user info first
   - Triggers OTP verification on submit
   - Shows OTP screen after initial registration
   - Completes registration after OTP verification

**How It Works**:
1. User fills registration form with name, email, and password
2. System stores data temporarily and sends OTP to email
3. User enters 6-digit OTP code
4. System verifies OTP and completes registration
5. User is automatically logged in after successful verification

**Testing**:
- In development mode, OTPs are logged to console (check backend logs)
- Set `MAIL_ENABLED=true` to enable actual email sending
- OTP expires after 10 minutes
- Users can resend OTP after 1-minute cooldown

## Double Data URI Prefix Issue (Fixed - Latest)

**Problem**: Images in the application were showing with invalid URLs like `data:image/jpeg;base64,data:image/jpeg;base64,...` causing images to fail loading with ERR_INVALID_URL.

**Root Cause**:
- Some components were adding the data URI prefix (`data:image/jpeg;base64,`) to base64 data that already contained the prefix
- Inconsistent handling of base64Data across different components

**Files Modified**:

1. **`/frontend/components/ImageSlideshow.tsx`**
   - Lines 71-85: Added logic to check if base64Data already has data URI prefix before adding it
   - Lines 168-176: Fixed thumbnail images to also check for existing prefix
   - Now properly handles both raw base64 and prefixed base64 data

2. **`/frontend/components/AddToCartButton.tsx`**
   - Lines 23-33: Updated to check if base64Data starts with 'data:' before adding prefix
   - Ensures consistent image URL formatting when adding to cart

3. **`/frontend/components/ProductActions.tsx`**
   - Lines 32-35 and 56-59: Fixed both "Add to Cart" and "Buy Now" actions
   - Now checks if base64Data already has the prefix before adding it

**Solution**:
- All components now check if `base64Data.startsWith('data:')` before adding the data URI prefix
- This prevents double prefixing when the data already contains the full data URI
- Maintains backward compatibility with both raw base64 and prefixed formats