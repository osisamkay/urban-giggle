---
title: Fix All App Issues (Production Readiness)
status: TODO
created: 2025-12-24
---

# 🛑 Task: Production Readiness Execution

This task tracks the execution of the [Production Readiness Plan](../../PRODUCTION_READINESS_PLAN.md).

## Current Focus: Phase 1 - Foundation

### 1. Image Optimization
- [ ] Scan `apps/web/src` for `<img>` tags.
- [ ] Replace with `<Image />`.
- [ ] Verify `next.config.js` domains.

### 2. Type Safety
- [ ] Fix `groups.map((group: any)` in `apps/web/src/app/groups/page.tsx`.
- [ ] Fix `products.map((product: any)` in `apps/web/src/app/products/page.tsx`.
- [ ] Fix Any types in `CreateGroupPage`.

### 3. SEO
- [ ] Add `metadata` export to `layout.tsx`.
- [ ] Add dynamic metadata to `apps/web/src/app/products/[id]/page.tsx`.

## Upcoming: Phase 2 - Commerce
- [ ] Implement Address Saving.
- [ ] Implement Stripe Mock/Integration.
