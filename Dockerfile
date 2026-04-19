# Build Stage
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
# Removed --frozen-lockfile to allow pnpm to update the lockfile to match current package.json
RUN pnpm install
RUN pnpm run build

# Production Stage
FROM base AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build /usr/src/app/apps/web/public ./apps/web/public
COPY --from=build /usr/src/app/apps/web/.next/standalone ./
COPY --from=build /usr/src/app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/web/server.js"]
