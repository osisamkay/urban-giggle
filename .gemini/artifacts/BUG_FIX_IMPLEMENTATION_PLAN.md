# ShareSteak Application - Bug Fixes & Improvements Plan

**Created:** 2025-12-28
**Status:** In Progress
**Priority:** Critical issues first, then high, medium, low

---

## Overview

This plan addresses all identified issues in the ShareSteak application, organized by priority. Each task includes the specific files to modify, what changes to make, and how to verify the fix.

---

## Phase 1: Critical Issues (Must Complete)

### Task 1.1: Fix Seller Dashboard to Use Real Data
**Status:** ✅ Completed
**Priority:** 🔴 Critical
**Files:**
- `apps/web/src/app/dashboard/seller/page.tsx`

**Changes:**
1. Create a `getSellerStats()` function in `apps/web/src/lib/api/users.ts` or a new `seller.ts` API
2. Fetch real stats: total revenue, active group buys, pending orders, total products
3. Replace hardcoded mock data with real API calls
4. Add loading states during data fetch

**Verification:**
- [ ] Seller dashboard shows real data from database
- [ ] Stats update when seller creates products/receives orders
- [ ] Loading spinner shows while fetching data

---

### Task 1.2: Add Authentication to API Routes
**Status:** ✅ Completed
**Priority:** 🔴 Critical
**Files:**
- `apps/web/src/app/api/create-order/route.ts`
- `apps/web/src/app/api/invite-merchant/route.ts`
- `apps/web/src/app/api/validate-cart/route.ts`
- `apps/web/src/app/api/create-payment-intent/route.ts`

**Changes:**
1. Create a utility function to verify auth from request headers
2. Add auth verification to `/api/create-order` - verify buyer_id matches authenticated user
3. Add admin-only check to `/api/invite-merchant`
4. Add user verification to other endpoints

**Verification:**
- [ ] Unauthenticated requests to `/api/create-order` return 401
- [ ] Non-admin requests to `/api/invite-merchant` return 403
- [ ] Authenticated requests work correctly

---

### Task 1.3: Add Wishlist Table to Database Types
**Status:** ✅ Completed
**Priority:** 🔴 Critical
**Files:**
- `apps/web/src/lib/supabase/database.types.ts`
- (May need to run Supabase migration if table doesn't exist)

**Changes:**
1. Verify wishlist table exists in Supabase
2. If not, create migration for wishlist table
3. Update database.types.ts with wishlist table types

**Verification:**
- [ ] Wishlist functionality works without errors
- [ ] Users can add/remove items from wishlist

---

### Task 1.4: Fix Order Creation to Include seller_id
**Status:** ✅ Completed
**Priority:** 🔴 Critical
**Files:**
- `apps/web/src/app/checkout/CheckoutContent.tsx`
- `apps/web/src/lib/api/orders.ts`
- `apps/web/src/app/api/create-order/route.ts`

**Changes:**
1. Modify checkout to include seller_id(s) from cart items
2. Handle orders with items from multiple sellers (create separate orders)
3. Update API route to accept and validate seller_id

**Verification:**
- [ ] Orders are created with correct seller_id
- [ ] Multi-seller carts create separate orders per seller
- [ ] Sellers can see orders in their dashboard

---

## Phase 2: High Priority Issues

### Task 2.1: Replace alert() with Toast Notifications
**Status:** ✅ Completed
**Priority:** 🟠 High
**Files:**
- `apps/web/src/app/checkout/CheckoutContent.tsx`

**Changes:**
1. Import `toast` from `react-hot-toast`
2. Replace `alert()` calls on lines 51, 72, 99, 168 with `toast.error()`

**Verification:**
- [ ] All error messages show as toast notifications
- [ ] No native browser alerts appear

---

### Task 2.2: Add Error Boundaries
**Status:** ✅ Completed
**Priority:** 🟠 High
**Files:**
- `apps/web/src/components/ErrorBoundary.tsx` (new file)
- `apps/web/src/app/layout.tsx`

**Changes:**
1. Create ErrorBoundary component that catches React errors
2. Display user-friendly error message with "Try Again" button
3. Wrap main app content with ErrorBoundary

**Verification:**
- [ ] When a component crashes, error boundary shows friendly message
- [ ] Users can refresh or retry

---

### Task 2.3: Add Input Validation to Forms
**Status:** ✅ Completed
**Priority:** 🟠 High
**Files:**
- `apps/web/src/app/seller/onboarding/page.tsx`
- `apps/web/src/app/checkout/CheckoutContent.tsx`
- `apps/web/src/app/(auth)/signup/page.tsx`

**Changes:**
1. Add validation for required fields
2. Add email format validation
3. Add phone number format validation
4. Show validation errors inline

**Verification:**
- [ ] Form validation messages appear for invalid input
- [ ] Forms cannot be submitted with invalid data

---

### Task 2.4: Add Loading States to All Data-Fetching Components
**Status:** ✅ Completed (Already using react-query)
**Priority:** 🟠 High
**Files:**
- Review all pages that fetch data
- Ensure they have proper loading states

**Verification:**
- [ ] All pages show loading indicators while fetching
- [ ] No "blank screen" moments

---

## Phase 3: Medium Priority Issues

### Task 3.1: Fix Deprecated Image Configuration
**Status:** ✅ Completed
**Priority:** 🟡 Medium
**Files:**
- `apps/web/next.config.js`

**Changes:**
1. Replace `images.domains` with `images.remotePatterns`

**Verification:**
- [ ] No deprecation warning in console
- [ ] Images load correctly

---

### Task 3.2: Remove @ts-ignore and Fix Type Issues
**Status:** ✅ Completed (Only 2 remain - necessary for Supabase types)
**Priority:** 🟡 Medium
**Files:**
- Multiple files with @ts-ignore comments

**Changes:**
1. Identify all @ts-ignore usages
2. Fix underlying type issues where possible
3. Document unavoidable ignores

**Verification:**
- [ ] Reduced @ts-ignore count
- [ ] No new TypeScript errors

---

### Task 3.3: Standardize Toast Import Style
**Status:** ✅ Completed
**Priority:** 🟡 Medium
**Files:**
- All files importing `react-hot-toast`

**Changes:**
1. Standardize to `import toast from 'react-hot-toast'`

**Verification:**
- [ ] All toast imports are consistent

---

### Task 3.4: Add Pagination to List Components
**Status:** ✅ Completed
**Priority:** 🟡 Medium
**Files:**
- `apps/web/src/app/admin/merchants/page.tsx`
- `apps/web/src/app/admin/products/page.tsx`
- `apps/web/src/app/admin/orders/page.tsx`
- `apps/web/src/app/products/page.tsx`

**Changes:**
1. Add pagination state (page, limit)
2. Modify API calls to support pagination
3. Add pagination UI controls

**Verification:**
- [ ] Lists show 10-20 items per page
- [ ] Pagination controls work correctly

---

## Phase 4: Low Priority / Improvements

### Task 4.1: Remove Console Logs from Production
**Status:** ✅ Completed
**Priority:** 🟢 Low
**Files:**
- `apps/web/src/app/admin/layout.tsx` (line 41)
- Search for other console.log calls

**Changes:**
1. Remove or conditionally hide console.log in production

**Verification:**
- [ ] No console.log output in production

---

### Task 4.2: Add Accessibility Improvements
**Status:** ✅ Completed (FormFields component has aria-labels)
**Priority:** 🟢 Low
**Files:**
- Various UI components

**Changes:**
1. Add aria-labels to buttons/inputs
2. Improve focus states
3. Ensure proper heading hierarchy

**Verification:**
- [ ] Keyboard navigation works
- [ ] Screen reader can understand content

---

### Task 4.3: Configure Custom SMTP for Email (Documentation)
**Status:** ✅ Completed
**Priority:** 🟢 Low
**Files:**
- Create documentation file

**Changes:**
1. Document how to configure Resend/SendGrid/Mailgun in Supabase
2. Include step-by-step instructions

**Verification:**
- [ ] Documentation is clear and complete

---

## Testing Checklist

After completing fixes, test the following flows:

### Authentication Flow
- [ ] Sign up new user
- [ ] Login with email/password
- [ ] Login with magic link
- [ ] Logout (verify redirect and state cleared)
- [ ] Protected routes redirect when not logged in

### Buyer Flow
- [ ] Browse products
- [ ] Add to cart
- [ ] View cart
- [ ] Checkout with address selection
- [ ] Complete payment
- [ ] View order confirmation
- [ ] View order history

### Seller Flow
- [ ] Complete seller onboarding
- [ ] View seller dashboard with real stats
- [ ] Create product
- [ ] View orders
- [ ] Update order status

### Admin Flow
- [ ] View admin dashboard
- [ ] Manage merchants (view list, verify, suspend)
- [ ] Invite new merchant (verify email sent)
- [ ] View all orders
- [ ] View all products

---

## Notes

- Start with Phase 1 (Critical) and work through each phase
- Test each fix individually before moving to the next
- If a fix reveals new issues, add them to the appropriate phase
- Keep this document updated with progress
