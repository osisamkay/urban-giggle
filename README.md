# ShareSteak - Modern Meat Marketplace Platform

A revolutionary meat marketplace platform that connects producers directly with consumers through innovative group purchasing mechanics and community features.

## Features

- **E-Commerce Platform**: Complete product catalog, shopping cart, and order management
- **Group Purchase System**: Unique group buying mechanics with tiered pricing
- **Seller Platform**: Comprehensive business management dashboard for meat producers
- **Community Features**: Forums, direct messaging, reviews, and ratings
- **Admin Panel**: User management, content moderation, and analytics
- **Real-time Updates**: Live group purchase coordination and messaging
- **Secure Authentication**: JWT-based auth with MFA support
- **Role-based Access Control**: BUYER/SELLER/ADMIN permissions

## Tech Stack

- **Frontend**: Next.js 15.4.1 with React 19
- **Language**: TypeScript 5.8.3
- **Database**: PostgreSQL 17 (Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: React Query 5.83.0 + Zustand 5.0.2
- **Build System**: Turborepo + PNPM
- **Payments**: Stripe integration ready

## Project Structure

```
sharesteak-monorepo/
├── apps/
│   └── web/              # Next.js frontend application
│       ├── src/
│       │   ├── app/      # App router pages
│       │   ├── components/ # React components
│       │   ├── lib/      # Utilities and config
│       │   └── store/    # Zustand stores
├── packages/
│   ├── types/           # Shared TypeScript definitions
│   ├── api-client/      # Type-safe API client
│   └── ui/              # Shared UI components
├── supabase/
│   └── migrations/      # Database migrations
└── turbo.json           # Turborepo configuration
```

## Prerequisites

- Node.js >= 20.0.0
- PNPM >= 9.0.0
- Supabase account
- Stripe account (for payments)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd urban-giggle
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Run the migrations from `supabase/migrations/` in your Supabase SQL editor

### 4. Configure environment variables

Create `apps/web/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The platform uses a comprehensive PostgreSQL schema with the following main tables:

- **users**: User profiles with role-based access
- **products**: Meat product catalog
- **orders**: Order management
- **group_purchases**: Group buying coordination
- **seller_profiles**: Seller business information
- **reviews**: Product reviews and ratings
- **forum_threads**: Community discussions
- **messages**: Direct messaging
- **notifications**: User notifications

See `supabase/migrations/` for complete schema details.

## Key Features Implementation

### Group Purchase System

The unique group purchasing feature allows users to:
- Create group purchases with tiered pricing
- Join existing groups
- Track real-time progress toward quantity goals
- Automatically unlock better prices as more participants join
- Set deadlines for group completion

### Authentication Flow

1. Users sign up as BUYER or SELLER
2. Email verification through Supabase Auth
3. Optional MFA for enhanced security
4. JWT-based session management
5. Role-based route protection

### Seller Dashboard

Sellers can:
- Create and manage product listings
- View and fulfill orders
- Track sales analytics
- Manage inventory
- Communicate with buyers

## Development

### Build all packages

```bash
pnpm build
```

### Lint code

```bash
pnpm lint
```

### Format code

```bash
pnpm format
```

### Clean build artifacts

```bash
pnpm clean
```

## API Client Usage

The `@sharesteak/api-client` package provides type-safe API methods:

```typescript
import { ProductsAPI, AuthAPI } from '@sharesteak/api-client';
import { supabase } from '@/lib/supabase/client';

const productsAPI = new ProductsAPI(supabase);
const result = await productsAPI.getProducts({ category: 'BEEF' });

if (result.success) {
  console.log(result.data);
}
```

## State Management

### Cart Store (Zustand)

```typescript
import { useCartStore } from '@/store/cartStore';

const { items, addItem, removeItem, getTotal } = useCartStore();
```

### Auth Store (Zustand)

```typescript
import { useAuthStore } from '@/store/authStore';

const { user, setUser, isAuthenticated } = useAuthStore();
```

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Environment Requirements

- Node.js 20+
- PostgreSQL database (Supabase)
- Stripe account for payments

## Security Features

- Row Level Security (RLS) on all database tables
- JWT-based authentication
- CSRF protection
- Rate limiting ready
- Input validation
- XSS protection
- Secure password hashing

## Performance Optimizations

- Code splitting and lazy loading
- Image optimization
- React Query caching
- Persistent cart state
- Optimized bundle size (~1.5-2MB)
- Server-side rendering where appropriate

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Proprietary - ShareSteak Platform

## Support

For support and questions, please contact the development team.

---

**Version**: 1.0.0
**Last Updated**: November 9, 2025
**Status**: Production Ready
