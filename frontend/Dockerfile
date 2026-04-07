# NearDrop web — Next.js standalone.
#
# DCDeploy (same pattern as backend): Context = ./frontend , Dockerfile = ./Dockerfile
#
# The context tarball does NOT include ../backend, but package.json uses file:../backend/packages/shared.
# This image shallow-clones the same Git repo inside the build to copy backend/packages/shared.
#
# Build args (set in DCDeploy when needed):
#   GIT_REPO   default https://github.com/vapmail16/neardrop.git  (change for forks/private mirrors)
#   GIT_REF    default main  — branch or tag name Git accepts with git clone --branch
#   API_UPSTREAM  — your public API base URL (https://..., no trailing slash); baked into next.config at build time
#
# Private GitHub: use a PAT in GIT_REPO URL or DCDeploy git credentials; see docs/FRONTEND_DEPLOYMENT_GUIDE.md
#
# Container listens on PORT (default 3000). Set DCDeploy service port + env PORT to the same value (not 80 as non-root).

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat git
WORKDIR /app

FROM base AS shared-fetch
ARG GIT_REPO=https://github.com/vapmail16/neardrop.git
ARG GIT_REF=main
RUN git clone --depth 1 --branch "${GIT_REF}" "${GIT_REPO}" /tmp/neardrop && \
    mkdir -p /app/backend/packages && \
    cp /tmp/neardrop/backend/tsconfig.base.json /app/backend/tsconfig.base.json && \
    cp -r /tmp/neardrop/backend/packages/shared /app/backend/packages/shared

FROM base AS builder
COPY --from=shared-fetch /app/backend /app/backend
# @neardrop/shared exposes dist/ only; Next typecheck needs compiled output.
WORKDIR /app/backend/packages/shared
RUN npm install && npm run build
WORKDIR /app/frontend
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG API_UPSTREAM=http://127.0.0.1:3010
ENV API_UPSTREAM=$API_UPSTREAM
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache curl && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone layout mirrors the monorepo: server.js lives under frontend/ (see outputFileTracingRoot).
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:3000/" > /dev/null || exit 1

CMD ["node", "frontend/server.js"]
