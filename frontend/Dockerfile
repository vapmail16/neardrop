# NearDrop web — Next.js `output: 'standalone'` (image built on DCDeploy; local build optional).
#
# CRITICAL: Docker build CONTEXT must be the repository root (parent of `frontend/` and `backend/`),
# because `frontend/package.json` depends on `file:../backend/packages/shared`.
#
# Local (from repo root):  docker build -f frontend/Dockerfile .
#
# DCDeploy: set build context to the repo root (`.`), Dockerfile path `frontend/Dockerfile`.
# Set build argument API_UPSTREAM to your deployed API origin (https://..., no trailing slash).

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- @neardrop/shared (linked from frontend via file:)
FROM base AS shared-builder
WORKDIR /app/backend/packages/shared
COPY backend/packages/shared/package.json backend/packages/shared/tsconfig.json backend/packages/shared/tsconfig.build.json ./
COPY backend/packages/shared/src ./src
RUN npm install && npm run build

# --- Next.js production build
FROM base AS frontend-builder
COPY --from=shared-builder /app/backend/packages/shared /app/backend/packages/shared
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./

ARG API_UPSTREAM=http://127.0.0.1:3010
ENV API_UPSTREAM=$API_UPSTREAM
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# --- Run standalone server
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache curl && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

ENV NODE_ENV=production
ENV PORT=3020
ENV HOSTNAME=0.0.0.0

COPY --from=frontend-builder /app/frontend/.next/standalone ./
COPY --from=frontend-builder /app/frontend/.next/static ./.next/static

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3020

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:3020/" > /dev/null || exit 1

CMD ["node", "server.js"]
