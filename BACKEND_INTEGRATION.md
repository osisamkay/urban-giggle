# Backend Integration Guide

This document outlines the backend integration setup and how to get started with the Supabase database.

## Setup Complete ✅

### 1. Supabase Client Configuration
- Created Supabase client at `apps/web/src/lib/supabase/client.ts`
- Generated TypeScript types at `apps/web/src/lib/supabase/database.types.ts`
- Configured authentication and session management

### 2. API Client Functions
Created comprehensive API modules for all features:

- **`lib/api/auth.ts`** - Authentication (signup, signin, password reset, profile updates)
- **`lib/api/products.ts`** - Product management (CRUD, filtering, search)
- **`lib/api/orders.ts`** - Order management (create, track, update status)
- **`lib/api/groups.ts`** - Group purchases (join, leave, manage)
- **`lib/api/notifications.ts`** - Notifications (create, read, mark as read)
- **`lib/api/addresses.ts`** - Address management (CRUD, set default)

### 3. Enhanced Auth Store
Updated `store/authStore.ts` with:
- Integrated Supabase authentication
- Sign in/up/out methods
- Persistent session storage
- Real-time auth state updates
- User profile management

## Quick Start

### 1. Install Dependencies
```bash
cd apps/web
pnpm install
```

### 2. Start Supabase Locally
```bash
cd ../../  # Back to project root
supabase start
```

This will output your local Supabase credentials:
```
API URL: http://localhost:54331
Anon key: eyJ...
Service role key: eyJ...
```

### 3. Create Environment File
Create `apps/web/.env.local`:

```bash
# Copy from the supabase start output
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54331
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-start
```

### 4. Run Database Migrations
```bash
supabase db reset  # This will run all migrations and seed data
```

### 5. Start the Development Server
```bash
cd apps/web
pnpm dev
```

## Database Schema

The database includes the following tables:

- **users** - User profiles (extends Supabase auth.users)
- **addresses** - User shipping addresses
- **seller_profiles** - Seller/producer information
- **products** - Product listings
- **orders** - Customer orders
- **order_items** - Items within orders
- **group_purchases** - Group buying opportunities
- **group_participants** - Users participating in group purchases
- **reviews** - Product reviews
- **notifications** - User notifications
- **messages** - Direct messaging
- **conversations** - Message threads

## API Usage Examples

### Authentication
```typescript
import { useAuthStore } from '@/store/authStore';

// In a component
const { signIn, signUp, signOut, user } = useAuthStore();

// Sign up
await signUp({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
});

// Sign in
await signIn('user@example.com', 'password123');

// Sign out
await signOut();
```

### Products
```typescript
import { productsApi } from '@/lib/api';

// Get all products
const products = await productsApi.getProducts();

// Get products with filters
const filtered = await productsApi.getProducts({
  category: 'BEEF',
  minPrice: 10,
  maxPrice: 100,
  search: 'ribeye'
});

// Get single product
const product = await productsApi.getProduct(productId);

// Get featured products
const featured = await productsApi.getFeaturedProducts(8);
```

### Orders
```typescript
import { ordersApi } from '@/lib/api';

// Create an order
const order = await ordersApi.createOrder({
  buyer_id: userId,
  items: [
    { product_id: '...', quantity: 2, price_at_purchase: 25.99 }
  ],
  shipping_address_id: addressId,
  subtotal: 51.98,
  tax: 4.16,
  shipping: 0,
  total: 56.14
});

// Get user orders
const orders = await ordersApi.getUserOrders(userId);

// Update order status
await ordersApi.updateOrderStatus(orderId, 'SHIPPED');
```

### Group Purchases
```typescript
import { groupsApi } from '@/lib/api';

// Get active groups
const groups = await groupsApi.getActiveGroups();

// Join a group
await groupsApi.joinGroup(groupId, userId, quantity);

// Check if user is in group
const isInGroup = await groupsApi.isUserInGroup(groupId, userId);
```

## Next Steps

### Immediate Tasks
1. ✅ Create `.env.local` file with Supabase credentials
2. ✅ Start Supabase locally: `supabase start`
3. ✅ Run migrations: `supabase db reset`
4. 🔄 Update login/signup pages to use the auth store
5. 🔄 Connect products page to fetch from database
6. 🔄 Integrate cart checkout with orders API
7. 🔄 Connect group purchases to database
8. 🔄 Add wishlist table and API

### Additional Features to Implement
- File upload for product images (Supabase Storage)
- Real-time updates for group purchases
- Stripe payment integration
- Email notifications
- Search with full-text search
- Admin dashboard
- Seller analytics

## Row Level Security (RLS)

The database has RLS policies to enforce security:
- Users can only view/edit their own data
- Sellers can only manage their own products
- Public can view active products
- Orders are only visible to buyers and sellers

## Testing

You can test the integration by:
1. Starting Supabase and the dev server
2. Signing up a new user
3. Creating test products (as a seller)
4. Browsing and adding to cart
5. Completing checkout flow

## Troubleshooting

**"Missing Supabase environment variables"**
- Make sure `.env.local` exists in `apps/web/`
- Check that variables are prefixed with `NEXT_PUBLIC_`

**"relation does not exist"**
- Run `supabase db reset` to apply migrations

**Authentication errors**
- Check Supabase is running: `supabase status`
- Verify API URL and keys in `.env.local`

## Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Zustand Persist](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
