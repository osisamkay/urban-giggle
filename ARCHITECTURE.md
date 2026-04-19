# Sharesteak Architecture Map

## 🏗 System Overview
Sharesteak is a high-performance e-commerce platform implemented as a **Turborepo Monorepo**. It utilizes a decoupled architecture where the frontend and shared logic are separated from the backend infrastructure.

## 🛠 Technology Stack
- **Monorepo Manager:** Turborepo + pnpm
- **Frontend:** Next.js (App Router), Tailwind CSS
- **Backend-as-a-Service:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Type System:** TypeScript (Shared across monorepo)
- **Testing:** Vitest (Unit/Integration), Playwright (E2E)
- **Deployment:** Docker + Docker Compose

## 📦 Monorepo Structure

### `apps/web` (The Frontend)
The primary user interface.
- `src/app`: Next.js routes and page layouts.
- `src/components`: Reusable UI components.
- `src/lib`: Core business logic and utility functions.
- `src/store`: Client-side state management.
- `middleware.ts`: Request handling and auth guards.

### `packages/api-client` (The SDK)
A centralized TypeScript client that abstracts all backend communication.
- **Modular Handlers:**
    - `auth.ts`: User authentication and session management.
    - `products.ts`: Product catalog and inventory logic.
    - `orders.ts`: Checkout and order tracking.
    - `groups.ts`: Group-buying logic.
    - `forums.ts`: Community and discussion features.
    - `messages.ts`: Direct communication.
    - `reviews.ts`: Product feedback and ratings.
    - `seller.ts`: Vendor management tools.

### `packages/types` (The Truth)
Centralized type definitions used by both the `web` app and the `api-client` to ensure end-to-end type safety.

### `supabase/` (The Infrastructure)
- `migrations/`: Version-controlled database schema changes.
- `config.toml`: Supabase project configuration.
- `seed.sql`: Initial data for development environments.

## 🔄 Data Flow
`User Interface (Next.js)` $\rightarrow$ `api-client (SDK)` $\rightarrow$ `Supabase API` $\rightarrow$ `PostgreSQL/Auth/Storage`

## 🚀 Development Workflow
- **Build:** `turbo build`
- **Dev:** `turbo dev`
- **Test:** `vitest` for units, `playwright` for E2E journeys.
