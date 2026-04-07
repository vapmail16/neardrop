# NearDrop API — multi-stage image (built on DCDeploy; local `docker build` optional)
# See docs/BACKEND_DEPLOYMENT_GUIDE.md and docs/DEPLOYMENT_ISSUE_LOG.md

FROM node:20-alpine AS builder

WORKDIR /app

# Native addons (e.g. bcrypt) may compile during npm ci
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json packages/shared/tsconfig.build.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

RUN npm ci

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

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/

# bcrypt may compile on Alpine if a prebuild is missing; build tools are removed after install
RUN npm ci --omit=dev && npm cache clean --force && \
    apk del python3 make g++

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3010

# Health route is GET /api/v1/health (must match PORT)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/api/v1/health" | grep -q '"success":true' || exit 1

CMD ["node", "dist/server.js"]
