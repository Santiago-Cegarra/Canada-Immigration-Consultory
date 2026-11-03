# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable
WORKDIR /app

# -----------------------------------------------------------------------------
# 1. Dependencias y generación del cliente de Prisma (usado también para migraciones)
# -----------------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# 2. Entorno local de desarrollo (usado por docker-compose.yml)
# -----------------------------------------------------------------------------
FROM deps AS dev
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY . .

EXPOSE 3000
CMD ["pnpm", "dev"]

# -----------------------------------------------------------------------------
# 3. Compilación de la aplicación Next.js (modo standalone)
# -----------------------------------------------------------------------------
FROM deps AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN pnpm build

# -----------------------------------------------------------------------------
# 4. Imagen final de producción (usada por docker-compose.prod.yml)
# -----------------------------------------------------------------------------
FROM node:22-alpine AS prod
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
