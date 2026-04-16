# Production Readiness Plan

This document outlines the roadmap to bring ShareSteak to a production-ready state, addressing functional gaps, UX improvements, and technical debt.

## 📋 Phase 1: Foundation, Security & Performance (Priority: High)
*Focus: Fixing technical debt, improving performance, and ensuring type safety.*

- [x] **Image Optimization**
    - Replace all `<img>` tags with `next/image` components.
    - Configure `next.config.js` for remaining image domains if needed.
- [x] **Type Safety**
    - Audit codebase for `any` usage.
    - Create/Update shared types in `@sharesteak/types` for `Group`, `Product`, `Order`.
    - Apply proper types to API responses and Component props.
- [x] **SEO & Metadata**
    - Add dynamic `generateMetadata` for `/products/[id]` and `/groups/[id]`.
    - implementation canonical URLs and OpenGraph tags.
- [x] **Linting & Code Quality**
    - Fix ESLint warnings (verify build succeeds without errors).

## 🛒 Phase 2: Commerce Core (Priority: High)
*Focus: Making the checkout process actually work.*

- [x] **Address Management**
    - Create `AddressesAPI` to CRUD user addresses.
    - Update `CheckoutPage` Step 1 to Save/Select addresses.
    - Persist `shipping_address_id` in Order creation.
- [x] **Stripe Payments**
    - Create API route `/api/create-payment-intent`.
    - Integrate `@stripe/react-stripe-js` elements in `CheckoutPage` Step 2.
    - Validate payment confirmation before creating the Order.
- [x] **Cart Refinements**
    - [x] Persist cart to LocalStorage (or Database for logged-in users).
    - [x] Handle stock validation before checkout.

## 📦 Phase 3: Seller Operations & Fulfillment (Priority: Medium)
*Focus: Empowering sellers to manage their business.*

- [x] **Order Fulfillment**
    - Add "My Orders" page (`/orders`).
    - Add "Order Details" page (`/orders/[id]`).
    - Create `OrdersAPI` (done/exists).
    - Add seller dashboard for fulfilling orders (`/dashboard/orders`). (If user is seller).
- [x] **Order Management**
    - Add Status controls (Pending -> Processing -> Shipped) in Seller Dashboard.
    - Add "Tracking Number" input field for shipped orders.
- [x] **Group Buy Management**
    - [x] "Close Group" button for early termination.
    - [x] "Print Packing List" feature (generate PDF or print-friendly view).
    - [x] "Message Participants" feature for group updates.
- [x] **Inventory Sync**
    - Automatically decrement product stock upon Order/Share confirmation.

## ✨ Phase 4: UX & Engagement (Priority: Medium)
*Focus: Making the app feel premium and alive.*

- [x] **Notifications System**
    - Real-time notifications for order updates, shares, and messages.
- [x] **Reviews & Ratings**
    - "Write Review" modal with star rating and photo upload (photo pending)
    - Display reviews on Product Page.
- [x] **Micro-Animations**
    - Use Framer Motion for smooth transitions and hover effects (Buttons, Cards).

## 📊 Phase 5: Admin & Analytics (Priority: Low)
*Focus: Platform oversight.*

- [x] **Admin Analytics**
    - Implement real charts (using Recharts) for Revenue/Users.
- [x] **User Management**
    - "Ban User" / "Promote User" functionality in Admin Dashboard (via Role Change).
