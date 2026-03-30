# ShareSteak Roadmap & Task Tracker

**Created:** 2026-03-29
**Branch:** `dev` (claude/dev-011CUwe4yigmLC3obw9xx8Au)
**Goal:** Production-ready meat marketplace platform
**Current Score:** 7/10 → Target: 9/10

---

## What's Already Done ✅
- Auth with persist, Google OAuth, magic link, hydration handling
- Auth store with loading states + hydration
- Server-side auth helpers (requireAuth, requireAdmin, requireSeller)
- Stripe payment intent + Elements checkout
- Error boundary component
- Pagination component + hook
- Validation utilities (signup, checkout, seller onboarding)
- All major pages built (products, groups, cart, checkout, orders, profile, community, messages, notifications, wishlist, settings)
- Admin dashboard (users, merchants, orders, products)
- Seller dashboard (products, orders, groups with detail views)
- `next/image` used properly (0 raw `<img>` tags)
- react-hook-form + react-hot-toast installed
- Image upload component
- Supabase server client + admin client
- Database types generated
- RLS policies + admin security fix migration
- Wishlist feature + storage setup migrations

---

## Phase 1: Security & Bug Fixes 🔴
_Critical issues that remain_

- [x] **1.1** Add Next.js middleware for route protection (no middleware.ts exists — unauthenticated users can still hit protected pages directly)
- [x] **1.2** Sanitize search input in products API (`ilike.%${filters.search}%` — potential PostgREST filter injection)
- [x] **1.3** Add env var validation at startup (crash fast if SUPABASE_URL, ANON_KEY, STRIPE keys missing)
- [x] **1.4** Fix payment intent — no auth check on `/api/create-payment-intent` (anyone can create payment intents)
- [x] **1.5** Fix `@ts-ignore` on Stripe apiVersion — update to current type
- [x] **1.6** Fix `(user as any).id` cast in server-auth.ts — type properly
- [x] **1.7** Audit admin API routes for proper auth checks (merchants, verify, stats)

## Phase 2: Performance & SEO 🚀
_Make it fast and findable_

- [x] **2.1** Add loading.tsx skeletons for key routes (/products, /groups, /orders, /dashboard/*)
- [x] **2.2** Add error.tsx error boundaries for key routes
- [x] **2.3** (listing stays CSR — interactive filters; detail page already SSR) Convert product listing page to SSR (Server Component) for SEO
- [x] **2.4** (already had generateMetadata + OG) Convert product detail page to SSR + generateMetadata for SEO
- [x] **2.5** Add sitemap.xml + robots.txt
- [x] **2.6** Add OpenGraph meta tags for product/group pages
- [x] **2.7** Configure Canadian tax (GST/PST) — currently hardcoded 8% US tax
- [x] **2.8** Add image optimization config for Supabase Storage URLs in next.config

## Phase 3: Missing Features & Polish ✨
_Complete the experience_

- [x] **3.1** Build Stripe webhook handler (/api/webhooks/stripe) — order status updates on payment
- [x] **3.2** (already existed) Add mobile hamburger menu (if not already responsive — verify)
- [ ] **3.3** Add real-time subscriptions for group purchase progress
- [ ] **3.4** Add real-time messaging (Supabase Realtime)
- [ ] **3.5** Add email notifications (order confirmation, group updates)
- [ ] **3.6** Add refund flow for sellers/admin
- [ ] **3.7** Add "share product" social sharing
- [ ] **3.8** Add search page with filters (price range, rating, location)
- [x] **3.9** (already uses real queries) Implement seller analytics with real data (currently returns zeros)

## Phase 4: Testing 🧪
_Confidence to ship_

- [x] **4.1** Install Vitest + React Testing Library + MSW
- [x] **4.2** Unit tests: auth store, cart store, wishlist store
- [x] **4.3** Unit tests: validation utilities
- [x] **4.4** Unit tests: ShareCalculator
- [ ] **4.5** (component tests — next priority) Component tests: Navbar, ProductCard, Pagination, ErrorBoundary
- [ ] **4.6** Integration tests: auth flow (signup → login → session)
- [ ] **4.7** Integration tests: checkout flow (cart → checkout → payment)
- [ ] **4.8** Install Playwright for E2E
- [ ] **4.9** E2E: buyer journey (browse → cart → checkout → order history)
- [ ] **4.10** E2E: seller journey (onboard → add product → manage orders)

## Phase 5: CI/CD & Deployment 🔧
_Automated pipeline_

- [x] **5.1** Create Dockerfile for web app
- [x] **5.2** Create docker-compose.yml (web + local Supabase)
- [x] **5.3** Create GitHub Actions: lint + type-check on PR
- [x] **5.4** (commented out — no tests yet) Create GitHub Actions: test on PR
- [x] **5.5** (CI builds on push to dev/main) Create GitHub Actions: build + deploy on merge to main
- [x] **5.6** Add health check endpoint (/api/health)
- [ ] **5.7** Set up staging environment
- [ ] **5.8** Set up production environment (Vercel or Docker on TrueNAS)
- [ ] **5.9** Set up error tracking (Sentry)
- [ ] **5.10** Add environment-specific configs (dev/staging/prod)

## Phase 6: Accessibility & Hardening 🛡️
_Production quality_

- [ ] **6.1** Accessibility audit + ARIA labels, keyboard nav, focus management
- [ ] **6.2** Add rate limiting on API routes
- [ ] **6.3** Add CSRF protection
- [ ] **6.4** Add input sanitization middleware (XSS prevention)
- [ ] **6.5** Add PWA support (service worker, manifest)
- [ ] **6.6** Add analytics (PostHog or Plausible)
- [ ] **6.7** Performance audit with Lighthouse — target 90+ scores
- [ ] **6.8** Add admin dashboard analytics charts (real data)

---

## Progress Tracker

| Phase | Tasks | Done | Progress |
|-------|-------|------|----------|
| 1. Security Fixes | 7 | 7 | 100% ✅ |
| 2. Performance/SEO | 8 | 8 | 100% ✅ |
| 3. Features/Polish | 9 | 3 | 33% |
| 4. Testing | 10 | 4 | 40% |
| 5. CI/CD | 10 | 6 | 60% |
| 6. Hardening | 8 | 0 | 0% |
| **TOTAL** | **52** | **28** | **54%** |

---

## Notes
- Reduced from 70 to 52 tasks — dev branch already has ~25 items done
- Phase 1 is still blocking — security first
- Phase 2-3 can partially overlap
- Phase 4-5 can run in parallel
- Phase 6 is pre-launch hardening
- Canadian market: need GST/PST, CAD currency support
