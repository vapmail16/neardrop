# NearDrop API — multi-stage image (DCDeploy builds this in the cloud).
#
# DCDeploy (same pattern as mahimapareek backend):
#   • Root directory / build context:  backend   ← subfolder of the Git repo, NOT the monorepo root
#   • Dockerfile path:                 Dockerfile   (default when the Dockerfile lives inside that folder)
#   • Exposed port:                    3010
#
# With context = backend/, all COPY paths are relative to backend/ (e.g. packages/shared, src).
#
# Runtime: you MUST set JWT_SECRET (32+ chars) and DATABASE_URL in the service environment
# or the process exits on startup with: Invalid environment: JWT_SECRET: Required
#
# See backend/DCDeploy_ENV_VARS.md and docs/BACKEND_DEPLOYMENT_GUIDE.md

FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/tsconfig.json packages/shared/tsconfig.build.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

RUN npm run build

# --- Production ---
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache curl python3 make g++

ENV NODE_ENV=production
ENV PORT=3010
ENV HOST=0.0.0.0

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/

RUN npm ci --omit=dev && npm cache clean --force && \
    apk del python3 make g++

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3010

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:3010/api/v1/health" | grep -q '"success":true' || exit 1

CMD ["node", "dist/server.js"]
