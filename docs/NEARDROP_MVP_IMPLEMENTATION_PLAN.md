# NearDrop MVP — Comprehensive Implementation Plan

**Version:** 1.0
**Date:** April 1, 2026
**Status:** Plan Only (No Implementation)
**Target:** Grant/Funding Demo — London PoC
**Architecture Reference:** `docs/NearDrop_Tech_Architecture_v01.pdf`
**Best Practices Sources:** `example_documents/MASTER_CHECKLIST.md`, `MASTER_GUIDELINES.md`, `CRITICAL_E2E_AUDIT_PROMPT.md`, `test-suite-system-prompt.md`, `HISTORICALS_CRITICAL_AUDIT_AND_PHASED_IMPLEMENTATION_PLAN.md`
**Mobile App Reference:** Sekhmira project (Expo + React Native + TypeScript clean architecture)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [MVP Scope Definition](#2-mvp-scope-definition)
3. [Architecture Decisions](#3-architecture-decisions)
4. [Technology Stack](#4-technology-stack)
5. [Monorepo Structure](#5-monorepo-structure)
6. [Data Models & Database Schema](#6-data-models--database-schema)
7. [API Contract Design](#7-api-contract-design)
8. [Feature Specifications — All 4 Portals](#8-feature-specifications--all-4-portals)
9. [Phased Implementation Plan (Stage-Gated)](#9-phased-implementation-plan-stage-gated)
10. [TDD Workflow & Quality Gates](#10-tdd-workflow--quality-gates)
11. [Testing Strategy](#11-testing-strategy)
12. [Security & Production Readiness from Day 1](#12-security--production-readiness-from-day-1)
13. [Stage Gate Rules](#13-stage-gate-rules)
14. [Policy Decisions Required](#14-policy-decisions-required)
15. [Risk Register](#15-risk-register)
16. [Definition of Done](#16-definition-of-done)
17. [Expansion-Ready Architecture Contracts](#17-expansion-ready-architecture-contracts)

---

## 1. Executive Summary

NearDrop is a neighbourhood last-mile delivery consolidation platform. This plan defines the **minimum viable product (MVP)** required for a grant/funding demonstration — covering all 4 user types (Carrier, Customer, Affiliate, Ops) with the minimum feature set to demonstrate one complete end-to-end parcel journey.

### Key Principle

> **Build the MVP as if it is Phase 1 of a production system.** Every architectural decision, database schema, API contract, auth pattern, and test must be designed so that Phase 2+ features plug in without rebuilding foundations. This costs ~20% more effort upfront but saves 70% overall (ref: MASTER_GUIDELINES Core Principle).

### What This MVP Proves

1. Three-sided marketplace works — carriers, affiliates, and customers interact through the platform
2. Parcels flow end-to-end through all 6 lifecycle states
3. QR-based secure handover eliminates wrong-parcel collection
4. Postcode-based Affiliate matching is automated
5. Ops has full visibility across the network
6. The team can build and ship working software with production-grade practices

---

## 2. MVP Scope Definition

### In Scope (Must Have)

| Portal | Features |
|--------|----------|
| **Carrier Portal (Web)** | Login, upload parcel manifest (CSV/form), view parcel status list, view drop confirmation (timestamp + photo) |
| **Customer Portal (PWA)** | Register + set postcode, view incoming/ready parcels, email notification on state change, view QR collection code, view assigned Affiliate on map |
| **Affiliate App (Mobile)** | Register + declare postcode + capacity, view today's expected/received parcels, confirm parcel receipt (scan/manual), scan customer QR to complete handover, view earnings summary |
| **Ops Console (Web)** | Login (ops role), view all Affiliates (list + map), view all parcels + status pipeline, view basic stats, manually assign/reassign parcel |
| **Backend** | Auth (JWT + 4 roles), Parcel Service (6-state machine), Postcode matching, QR generation/validation, Email notifications, Database (PostgreSQL) |

### Out of Scope (Phase 2+) — But Architecture Must Support

| Feature | Why Deferred | Architecture Stub Required |
|---------|-------------|--------------------------|
| Carrier API integration (Tier 1/2) | Requires carrier commercial agreement | Integration Gateway service interface defined |
| Stripe Connect payouts | Requires business bank account | Earnings table schema with payout_status column |
| Push notifications (FCM) | Email sufficient for demo | Notification service abstraction (channel-agnostic) |
| ID verification (Onfido) | Cost + legal setup | Affiliate verification_status enum in schema |
| Redis caching | Not needed at demo scale | Cache service interface defined |
| SQS/SNS event bus | Not needed at demo scale | Event emitter abstraction in code |
| S3 photo storage | Local file storage on server for MVP | Storage service interface defined |
| React Native mobile app | Web-based Affiliate portal faster for MVP | Shared API contract allows RN app to plug in |
| Advanced analytics | Basic stats sufficient | Analytics service interface defined |

### Architectural Stubs Explained

Every deferred feature gets a **service interface** (TypeScript interface/abstract class) in the codebase from day 1. The MVP uses a simple local implementation. Phase 2+ swaps in the production implementation without changing consumers. This is the **Dependency Inversion Principle** applied systematically.

---

## 3. Architecture Decisions

### Decision 1: Monorepo with Shared Packages

**Choice:** Turborepo monorepo
**Rationale:** Single repo for backend, all frontends, and shared packages. Consistent tooling, atomic commits across packages, shared TypeScript types.
**Expansion path:** Add `packages/mobile-affiliate` (React Native/Expo) when ready for app stores.

### Decision 2: Backend Architecture — Layered Microservice-Ready Monolith

**Choice:** Single Fastify server with domain-separated modules (routes → services → repositories)
**Rationale:** Microservices from day 1 is overweight for a grant demo. But internal code is structured as if each domain service (Parcel, User, Affiliate, Notification, Collection) is a separate module with clean interfaces. When scaling requires it, modules can be extracted to independent services without refactoring business logic.
**Expansion path:** Extract any module to its own service behind the same API Gateway.

### Decision 3: All Web Frontends in One Next.js App

**Choice:** Single Next.js 14 app with role-based route groups (`/carrier/*`, `/customer/*`, `/affiliate/*`, `/ops/*`)
**Rationale:** Fastest path to 4 working portals. Shared component library, single deployment, single auth flow. The Affiliate portal is web-based for MVP (works in mobile browser) but the API contract is identical to what a future React Native app would consume.
**Expansion path:** Extract Affiliate routes to standalone React Native app; other portals can stay or split.

### Decision 4: Auth — NextAuth.js + JWT + RBAC

**Choice:** NextAuth.js with credentials provider, JWT strategy, role-based middleware
**Rationale:** Much faster than Cognito setup for a demo. JWT tokens work identically for future mobile app. RBAC middleware pattern is the same regardless of auth provider.
**Expansion path:** Swap credentials provider for Cognito/OAuth without changing middleware or frontend.

### Decision 5: Database — PostgreSQL with Migration System

**Choice:** PostgreSQL 15 with node-pg-migrate
**Rationale:** Production database from day 1 (ref: MASTER_GUIDELINES — never start with SQLite for web apps). PostGIS extension available for future geospatial queries. Migration system ensures reproducible schema changes.
**Expansion path:** Add PostGIS, read replicas, connection pooling optimizations.

### Decision 6: Affiliate App Strategy — Web First, Mobile Later

**Choice:** Web-based Affiliate portal in Next.js for MVP; React Native (Expo) app for Phase 2
**Rationale:** Building a React Native app doubles the frontend effort. A PWA-capable Next.js page works in mobile browsers and demonstrates all functionality. The API contract is identical, so the Expo app (following Sekhmira architecture patterns) plugs in directly.
**Expansion path:** Build Expo app following Sekhmira clean architecture (presentation → hooks → storage/services), consuming the same backend API.

---

## 4. Technology Stack

### Backend

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Runtime | Node.js 20 LTS | As specified in architecture doc |
| Language | TypeScript 5.x (strict mode) | Type safety across all packages |
| Framework | Fastify 4.x | High throughput, schema validation built-in |
| Database | PostgreSQL 15 | ACID, PostGIS-ready, production-grade |
| ORM/Query | Knex.js | Query builder with migration support, not a heavy ORM |
| Migrations | Knex built-in | Up/down migrations, versioned, reversible |
| Validation | Zod | Runtime validation matching TypeScript types |
| Logging | Pino (Fastify default) | Structured JSON logging, fast, production-grade |
| Auth | JWT (jsonwebtoken) | Stateless, works for web + future mobile |
| QR Codes | qrcode + crypto | QR generation + cryptographic token signing |
| Email | Nodemailer + Resend | Simple for demo, swappable for SES later |
| Testing | Vitest + Supertest | Fast, TypeScript-native, HTTP testing |

### Frontend (All Portals)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14 (App Router) | SSR, PWA support, route groups for multi-portal |
| Language | TypeScript 5.x (strict mode) | Shared types with backend |
| Styling | Tailwind CSS 3.x | Rapid UI development, consistent design |
| State | React Context + SWR | SWR for data fetching/caching, Context for auth state |
| Maps | Leaflet (react-leaflet) | Free, no API key needed for demo (vs Google Maps) |
| QR Scanner | html5-qrcode | Browser-based QR scanning for Affiliate portal |
| Charts | Recharts | Simple stats for Ops dashboard |
| Testing | Vitest + React Testing Library + Playwright | Unit + Integration + E2E |

### Future Mobile App (Phase 2 — Sekhmira Pattern)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React Native 0.81+ (Expo ~54) | Single codebase iOS + Android |
| Language | TypeScript strict mode | Consistent with monorepo |
| Navigation | React Navigation (bottom-tabs + native-stack) | Proven pattern from Sekhmira |
| State | Custom hooks + AsyncStorage + Context | Clean architecture layers from Sekhmira |
| Camera/QR | expo-camera + expo-barcode-scanner | Native barcode scanning |
| Notifications | expo-notifications + FCM | Push notification support |
| Testing | Jest + @testing-library/react-native | Exact Sekhmira testing stack |
| Coverage | 90% minimum enforced in jest.config.js | Elevated quality gate |

### Infrastructure (MVP — Minimal Cost)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Hosting | Railway or Render | Free/cheap tiers, managed PostgreSQL, zero DevOps |
| Frontend | Vercel | Free tier, automatic Next.js deployment |
| CI/CD | GitHub Actions | Free for public repos, automated test/deploy |
| DNS | Cloudflare (free tier) | Free SSL, caching |

### Infrastructure (Phase 2 — AWS Migration Path)

| Layer | Technology |
|-------|-----------|
| Compute | AWS ECS Fargate |
| Database | AWS RDS PostgreSQL |
| Cache | AWS ElastiCache (Redis) |
| Storage | AWS S3 + CloudFront |
| Auth | AWS Cognito |
| Events | AWS SQS + SNS |
| IaC | Terraform |

---

## 5. Monorepo Structure

**Repository layout:** The Git remote/checkout root may include symlinks `🔗 .github → project_scaffolding/.github` and `🔗 .gitignore → project_scaffolding/.gitignore` so GitHub Actions and ignore rules resolve at the repo root while canonical files live under `project_scaffolding/`. Optional local Postgres files go in `project_scaffolding/data/pgdata/` (gitignored).

```
project_scaffolding/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint + test + typecheck on every PR
│       └── deploy.yml                # Deploy on merge to main
├── .env.example                      # All required env vars (no secrets)
├── .gitignore
├── README.md                         # Project setup, architecture overview
├── turbo.json                        # Turborepo pipeline config
├── package.json                      # Root workspace config
├── tsconfig.base.json                # Shared TypeScript config (strict mode)
├── data/
│   └── pgdata/                       # Optional local PostgreSQL data dir (gitignored)
│
├── docs/
│   ├── NearDrop_Tech_Architecture_v01.pdf
│   ├── NEARDROP_MVP_IMPLEMENTATION_PLAN.md  (this document)
│   ├── TDD_WORKFLOW.md               # TDD process (adapted from Sekhmira)
│   ├── ISSUE_LOG.md                  # Issue tracking per user rules
│   └── API_REFERENCE.md              # API endpoint documentation
│
├── packages/
│   └── shared/                       # Shared TypeScript types + utils
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── types/
│           │   ├── index.ts          # Re-exports
│           │   ├── user.ts           # User, Role types
│           │   ├── parcel.ts         # Parcel, ParcelStatus types
│           │   ├── affiliate.ts      # Affiliate types
│           │   ├── carrier.ts        # Carrier types
│           │   ├── notification.ts   # Notification types
│           │   └── api.ts            # API request/response types
│           ├── constants/
│           │   ├── parcelStatuses.ts  # ENUM values
│           │   ├── roles.ts          # Role constants
│           │   └── errorCodes.ts     # Standardized error codes
│           ├── validation/
│           │   ├── schemas.ts        # Zod schemas (shared frontend + backend)
│           │   └── rules.ts          # Business validation rules
│           └── utils/
│               ├── formatters.ts     # Date, currency, postcode formatting
│               └── validators.ts     # Postcode validation, email validation
│
├── apps/
│   ├── api/                          # Backend API server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   ├── knexfile.ts               # Database migration config
│   │   └── src/
│   │       ├── server.ts             # Fastify app entry point
│   │       ├── config/
│   │       │   ├── index.ts          # Environment config loader + validation
│   │       │   ├── database.ts       # DB connection config
│   │       │   └── auth.ts           # Auth config (JWT secret, expiry)
│   │       ├── plugins/
│   │       │   ├── auth.ts           # Auth plugin (JWT verify, role check)
│   │       │   ├── errorHandler.ts   # Centralized error handler
│   │       │   ├── requestId.ts      # Request ID middleware
│   │       │   └── rateLimiter.ts    # Rate limiting plugin
│   │       ├── modules/
│   │       │   ├── user/
│   │       │   │   ├── user.routes.ts
│   │       │   │   ├── user.service.ts
│   │       │   │   ├── user.repository.ts
│   │       │   │   └── __tests__/
│   │       │   ├── parcel/
│   │       │   │   ├── parcel.routes.ts
│   │       │   │   ├── parcel.service.ts
│   │       │   │   ├── parcel.repository.ts
│   │       │   │   ├── parcel.stateMachine.ts
│   │       │   │   └── __tests__/
│   │       │   ├── affiliate/
│   │       │   │   ├── affiliate.routes.ts
│   │       │   │   ├── affiliate.service.ts
│   │       │   │   ├── affiliate.repository.ts
│   │       │   │   └── __tests__/
│   │       │   ├── carrier/
│   │       │   │   ├── carrier.routes.ts
│   │       │   │   ├── carrier.service.ts
│   │       │   │   ├── carrier.repository.ts
│   │       │   │   └── __tests__/
│   │       │   ├── collection/
│   │       │   │   ├── collection.routes.ts
│   │       │   │   ├── collection.service.ts
│   │       │   │   ├── qrToken.service.ts
│   │       │   │   └── __tests__/
│   │       │   ├── notification/
│   │       │   │   ├── notification.routes.ts
│   │       │   │   ├── notification.service.ts
│   │       │   │   ├── channels/
│   │       │   │   │   ├── email.channel.ts
│   │       │   │   │   └── channel.interface.ts  # Abstract for future push/SMS
│   │       │   │   └── __tests__/
│   │       │   └── analytics/
│   │       │       ├── analytics.routes.ts
│   │       │       ├── analytics.service.ts
│   │       │       └── __tests__/
│   │       ├── database/
│   │       │   ├── connection.ts      # Connection pool setup
│   │       │   ├── migrations/        # Knex migrations (timestamped)
│   │       │   └── seeds/             # Seed data for demo
│   │       ├── errors/
│   │       │   ├── AppError.ts
│   │       │   ├── ValidationError.ts
│   │       │   ├── NotFoundError.ts
│   │       │   └── UnauthorizedError.ts
│   │       ├── utils/
│   │       │   ├── logger.ts          # Pino structured logger
│   │       │   ├── crypto.ts          # Token signing, hashing
│   │       │   └── pagination.ts      # Cursor/offset pagination helper
│   │       └── interfaces/
│   │           ├── storage.interface.ts    # Abstract file storage
│   │           ├── cache.interface.ts      # Abstract cache
│   │           ├── eventBus.interface.ts   # Abstract event bus
│   │           └── carrier.gateway.ts      # Abstract carrier integration
│   │
│   └── web/                          # Next.js frontend (all 4 portals)
│       ├── package.json
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       ├── playwright.config.ts
│       ├── next.config.js
│       ├── tailwind.config.ts
│       └── src/
│           ├── app/
│           │   ├── layout.tsx         # Root layout
│           │   ├── page.tsx           # Landing page
│           │   ├── (auth)/
│           │   │   ├── login/page.tsx
│           │   │   └── register/page.tsx
│           │   ├── carrier/           # Carrier portal route group
│           │   │   ├── layout.tsx
│           │   │   ├── dashboard/page.tsx
│           │   │   ├── manifests/page.tsx
│           │   │   └── parcels/page.tsx
│           │   ├── customer/          # Customer portal route group
│           │   │   ├── layout.tsx
│           │   │   ├── dashboard/page.tsx
│           │   │   ├── parcels/page.tsx
│           │   │   └── parcels/[id]/page.tsx
│           │   ├── affiliate/         # Affiliate portal route group
│           │   │   ├── layout.tsx
│           │   │   ├── dashboard/page.tsx
│           │   │   ├── parcels/page.tsx
│           │   │   ├── scan/page.tsx
│           │   │   └── earnings/page.tsx
│           │   └── ops/               # Ops console route group
│           │       ├── layout.tsx
│           │       ├── dashboard/page.tsx
│           │       ├── affiliates/page.tsx
│           │       ├── parcels/page.tsx
│           │       └── stats/page.tsx
│           ├── components/
│           │   ├── common/            # Shared UI components
│           │   │   ├── Button.tsx
│           │   │   ├── Card.tsx
│           │   │   ├── Input.tsx
│           │   │   ├── StatusBadge.tsx
│           │   │   ├── DataTable.tsx
│           │   │   ├── Map.tsx
│           │   │   └── __tests__/
│           │   ├── carrier/           # Carrier-specific components
│           │   ├── customer/          # Customer-specific components
│           │   ├── affiliate/         # Affiliate-specific components
│           │   └── ops/               # Ops-specific components
│           ├── hooks/
│           │   ├── useAuth.ts
│           │   ├── useParcels.ts
│           │   ├── useAffiliates.ts
│           │   └── __tests__/
│           ├── services/
│           │   ├── api.ts             # Centralized API client (fetch wrapper)
│           │   ├── auth.service.ts
│           │   ├── parcel.service.ts
│           │   ├── affiliate.service.ts
│           │   └── __tests__/
│           ├── contexts/
│           │   ├── AuthContext.tsx
│           │   └── __tests__/
│           ├── lib/
│           │   ├── auth.ts            # NextAuth config
│           │   └── utils.ts           # Frontend utilities
│           └── __tests__/
│               ├── e2e/               # Playwright E2E tests
│               └── setup.ts           # Test setup
│
├── database/
│   └── schema.sql                    # Reference schema (source of truth is migrations)
│
└── scripts/
    ├── seed-demo.ts                  # Seed demo data for grant presentation
    ├── verify-env.ts                 # Validate all env vars at startup
    └── health-check.ts              # Health check script
```

---

## 6. Data Models & Database Schema

### Core Tables

**All tables follow these conventions (ref: MASTER_CHECKLIST Database section):**
- UUID primary keys (`uuid_generate_v4()`)
- `created_at` and `updated_at` timestamps on every table
- Foreign keys with explicit ON DELETE actions
- NOT NULL constraints on required fields
- CHECK constraints for business rules (enums, ranges)
- Indexes on all foreign keys and frequently queried columns

### Table: users

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('carrier', 'customer', 'affiliate', 'ops')),
  phone         VARCHAR(20),
  postcode      VARCHAR(10),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_postcode ON users(postcode);
```

### Table: affiliates

```sql
CREATE TABLE affiliates (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  postcode            VARCHAR(10) NOT NULL,
  address_line_1      VARCHAR(255) NOT NULL,
  address_line_2      VARCHAR(255),
  city                VARCHAR(100) NOT NULL DEFAULT 'London',
  max_daily_capacity  INTEGER NOT NULL DEFAULT 20 CHECK (max_daily_capacity > 0),
  current_load        INTEGER NOT NULL DEFAULT 0 CHECK (current_load >= 0),
  is_available        BOOLEAN NOT NULL DEFAULT true,
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' -- Ops must manually approve
                      CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  latitude            DECIMAL(10, 8),
  longitude           DECIMAL(11, 8),
  total_earnings      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  rating              DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX idx_affiliates_postcode ON affiliates(postcode);
CREATE INDEX idx_affiliates_available ON affiliates(is_available, verification_status);
```

### Table: carriers

```sql
CREATE TABLE carriers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name  VARCHAR(255) NOT NULL,
  api_tier      VARCHAR(10) NOT NULL DEFAULT 'tier_3'
                CHECK (api_tier IN ('tier_1', 'tier_2', 'tier_3')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carriers_user_id ON carriers(user_id);
```

### Table: parcels

```sql
CREATE TABLE parcels (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  carrier_id            UUID NOT NULL REFERENCES carriers(id) ON DELETE RESTRICT,
  carrier_ref           VARCHAR(100),
  affiliate_id          UUID REFERENCES affiliates(id) ON DELETE SET NULL,
  customer_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_name        VARCHAR(200) NOT NULL,
  recipient_postcode    VARCHAR(10) NOT NULL,
  recipient_email       VARCHAR(255),
  status                VARCHAR(30) NOT NULL DEFAULT 'manifest_received'
                        CHECK (status IN (
                          'manifest_received',
                          'in_transit',
                          'dropped_at_affiliate',
                          'ready_to_collect',
                          'collected',
                          'exception'
                        )),
  estimated_drop_time   TIMESTAMPTZ,
  actual_drop_time      TIMESTAMPTZ,
  collection_time       TIMESTAMPTZ,
  proof_of_drop_data    TEXT,
  collection_qr_token   VARCHAR(500),
  qr_token_expires_at   TIMESTAMPTZ,
  exception_type        VARCHAR(20) CHECK (exception_type IN (
                          'damaged', 'wrong_item', 'no_show', 'refused', 'lost'
                        )),
  exception_note        TEXT,
  per_parcel_fee        DECIMAL(6, 2) NOT NULL DEFAULT 0.50, -- configurable per carrier agreement
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parcels_carrier_id ON parcels(carrier_id);
CREATE INDEX idx_parcels_affiliate_id ON parcels(affiliate_id);
CREATE INDEX idx_parcels_customer_id ON parcels(customer_id);
CREATE INDEX idx_parcels_status ON parcels(status);
CREATE INDEX idx_parcels_recipient_postcode ON parcels(recipient_postcode);
CREATE INDEX idx_parcels_qr_token ON parcels(collection_qr_token);
```

### Table: parcel_status_history

```sql
CREATE TABLE parcel_status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcel_id   UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  status      VARCHAR(30) NOT NULL,
  actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role  VARCHAR(20),
  note        TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parcel_history_parcel_id ON parcel_status_history(parcel_id);
CREATE INDEX idx_parcel_history_status ON parcel_status_history(status);
CREATE INDEX idx_parcel_history_created ON parcel_status_history(created_at);
```

### Table: affiliate_earnings

```sql
CREATE TABLE affiliate_earnings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id    UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  parcel_id       UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  amount          DECIMAL(6, 2) NOT NULL CHECK (amount > 0),
  payout_status   VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed')),
  payout_date     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_earnings_affiliate_id ON affiliate_earnings(affiliate_id);
CREATE INDEX idx_earnings_payout_status ON affiliate_earnings(payout_status);
```

### Table: notifications

```sql
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parcel_id     UUID REFERENCES parcels(id) ON DELETE SET NULL,
  channel       VARCHAR(10) NOT NULL DEFAULT 'email'
                CHECK (channel IN ('email', 'push', 'sms')),
  type          VARCHAR(50) NOT NULL,
  subject       VARCHAR(255),
  body          TEXT NOT NULL,
  sent_at       TIMESTAMPTZ,
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
```

### Database Triggers

```sql
-- Auto-update updated_at on all tables
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_affiliates_updated_at BEFORE UPDATE ON affiliates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_carriers_updated_at BEFORE UPDATE ON carriers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_parcels_updated_at BEFORE UPDATE ON parcels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 7. API Contract Design

### Auth Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | Public | Register user (any role) |
| POST | `/api/v1/auth/login` | Public | Login, returns JWT |
| POST | `/api/v1/auth/logout` | Auth | Invalidate session |
| GET | `/api/v1/auth/me` | Auth | Get current user profile |

### Parcel Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/v1/parcels/manifest` | Carrier | Upload parcel manifest (CSV or JSON) |
| GET | `/api/v1/parcels` | Auth | List parcels (filtered by role) |
| GET | `/api/v1/parcels/:id` | Auth | Get parcel detail |
| GET | `/api/v1/parcels/:id/collection-qr` | Customer | Issue collection JWT for QR (when `ready_to_collect`) |
| PATCH | `/api/v1/parcels/:id/status` | Carrier, Affiliate, Ops | Update parcel status (`ready_to_collect` → `collected` is **ops-only**; affiliates use `POST …/collect`) |
| POST | `/api/v1/parcels/:id/drop-confirm` | Carrier | Confirm drop at Affiliate |
| POST | `/api/v1/parcels/:id/collect` | Affiliate | Validate QR + complete collection |
| PATCH | `/api/v1/parcels/:id/assign` | Ops | Manually assign/reassign Affiliate |
| POST | `/api/v1/parcels/:id/exception` | Affiliate, Ops | Report exception |

### Affiliate Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/v1/affiliates/register` | Auth (customer->affiliate upgrade) | Register as Affiliate |
| GET | `/api/v1/affiliates` | Ops | List all Affiliates |
| GET | `/api/v1/affiliates/:id` | Auth | Get Affiliate detail |
| PATCH | `/api/v1/affiliates/:id` | Affiliate, Ops | Update Affiliate info |
| GET | `/api/v1/affiliates/:id/earnings` | Affiliate, Ops | Get earnings summary |
| GET | `/api/v1/affiliates/match/:postcode` | System | Find Affiliate for postcode |

### Customer Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/customer/parcels` | Customer | List customer's parcels |
| GET | `/api/v1/customer/parcels/:id/qr` | Customer | Get QR collection code |
| GET | `/api/v1/customer/affiliate` | Customer | Get assigned Affiliate info |

### Ops Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/ops/stats` | Ops | Dashboard statistics |
| GET | `/api/v1/ops/parcels` | Ops | All parcels (full pipeline view) |
| GET | `/api/v1/ops/affiliates/map` | Ops | Affiliate locations for map |

### API Versioning

All endpoints are versioned under `/api/v1/`. Response headers include `X-API-Version: 1.0`. This allows non-breaking additions in v1 and breaking changes in v2 (ref: MASTER_CHECKLIST API Versioning section).

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Postcode is required",
    "details": [
      { "field": "recipient_postcode", "message": "Must be a valid UK postcode" }
    ],
    "requestId": "req_abc123"
  }
}
```

### Success Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "requestId": "req_abc123"
  }
}
```

---

## 8. Feature Specifications — All 4 Portals

### 8.1 Carrier Portal

**Login**: Email/password auth with `carrier` role check.

**Manifest Upload**:
- Upload CSV with columns: `carrier_ref, recipient_name, recipient_postcode, recipient_email, estimated_drop_time`
- Backend parses CSV, validates all rows, auto-matches each parcel to Affiliate by exact postcode match
- Unmatched parcels (no Affiliate in postcode) marked as 'unmatched' for Ops manual assignment
- Returns manifest summary: total parcels, assigned affiliates, unmatched count
- Each parcel enters state `MANIFEST_RECEIVED`
- Carriers can upload unlimited manifests per day

**Parcel Status List**:
- Table view of all carrier's parcels with status badges
- Filterable by status, date, postcode
- Status badges color-coded per lifecycle state

**Drop Confirmation**:
- View parcels in `IN_TRANSIT` state
- Mark as dropped: timestamp auto-captured, optional photo upload (saved to local file storage for MVP)
- Triggers state: `DROPPED_AT_AFFILIATE` -> `READY_TO_COLLECT`
- Triggers notification to customer

### 8.2 Customer Portal (PWA)

**Registration**:
- Email, password, name, postcode
- Postcode auto-matches to nearest Affiliate (displayed after registration)
- Role: `customer`

**Parcel Dashboard**:
- List of customer's parcels grouped by status
- Cards show: carrier ref, status, Affiliate name/address, estimated collection
- Real-time status (SWR polling every 30s)

**QR Collection Code**:
- Per-parcel QR code displayed when status is `READY_TO_COLLECT`
- QR encodes a cryptographically signed, single-use, 7-day-expiry JWT token
- Customer shows QR to Affiliate on collection

**Affiliate Info**:
- Map showing Affiliate location
- Affiliate name, address, opening hours
- Walking distance indicator

**Email Notifications**:
- On state change to `READY_TO_COLLECT`: "Your parcel is ready to collect from [Affiliate Name]"
- On state change to `COLLECTED`: "Your parcel has been collected"

### 8.3 Affiliate Portal (Web, Mobile-Optimized)

**Registration**:
- Extension of user registration with: address, postcode, max daily capacity
- Creates `affiliate` record linked to user
- `verification_status` starts as `pending` — Ops must manually approve before Affiliate can receive parcels
- Affiliate sees "Awaiting Approval" status until Ops verifies

**Today's Parcels Dashboard**:
- List of parcels assigned to this Affiliate
- Grouped: "Expected Today", "Received (Awaiting Collection)", "Collected Today"
- Count badges for each group

**Receive Parcel**:
- Carrier drops parcels; Affiliate confirms receipt
- Can scan barcode (carrier_ref) or manually enter reference
- Marks parcel as `DROPPED_AT_AFFILIATE`
- System auto-generates QR collection token and transitions to `READY_TO_COLLECT`
- Customer notified via email

**Handover (QR Scan)**:
- Camera-based QR scanner (html5-qrcode library)
- Scans customer's QR code
- Backend validates: token signature, expiry, single-use, correct parcel-affiliate match
- On success: marks parcel `COLLECTED`, records handover timestamp
- On failure: shows clear error (expired, already used, wrong affiliate)

**Earnings Summary**:
- Total earnings this month
- Per-parcel fee breakdown
- Payout status (mock for MVP — shows "Pending" with total amount)

### 8.4 Ops Console

**Login**: Email/password with `ops` role.

**Dashboard Stats**:
- Total active Affiliates
- Parcels today (by status breakdown)
- Collection rate (collected / ready_to_collect in last 7 days)
- Active postcodes count

**Affiliate Map**:
- Leaflet map of London with Affiliate markers
- Click marker to see: name, postcode, capacity, current load, rating
- Color-coded by availability (green = available, yellow = near capacity, red = full)

**Parcel Pipeline**:
- Full pipeline view: all parcels across all statuses
- Kanban-style or table view with filters
- Click parcel to see full status history

**Manual Assignment**:
- Override auto-assignment: pick a parcel and assign to different Affiliate
- Required for: unmatched parcels (no Affiliate in postcode), capacity reached, Affiliate unavailable

**Affiliate Approval**:
- New Affiliate registrations appear in a queue
- Ops reviews and approves/rejects each Affiliate
- Only verified Affiliates appear in postcode matching

**Exception Management**:
- View reported exceptions (damaged, wrong_item, no_show, refused, lost)
- 24-hour SLA timer displayed from exception report time
- Ops can resolve exception and return parcel to `READY_TO_COLLECT` if appropriate

---

## 9. Phased Implementation Plan (Stage-Gated)

**Workspace root:** The npm / Turborepo monorepo is rooted at **`project_scaffolding/`** (run all `npm` scripts from that directory). The Git repository root holds **`.git`**, symlinks to **`project_scaffolding/.github`** and **`project_scaffolding/.gitignore`**, and a short pointer [`README.md`](../../README.md). CI workflows are defined in **`project_scaffolding/.github/workflows/`**.

### Phase 0 — Foundation Setup (Days 1-3)

**Scope:** Project infrastructure, zero features.

**Tasks:**
1. Initialize Turborepo monorepo with workspace config
2. Set up `packages/shared` with TypeScript types, constants, Zod schemas
3. Set up `apps/api` with Fastify, TypeScript strict mode, Pino logger
4. Set up `apps/web` with Next.js 14, Tailwind CSS, TypeScript strict mode
5. Configure PostgreSQL connection with Knex and connection pooling
6. Create all database migrations (tables, indexes, constraints, triggers)
7. Run migrations on dev database and verify schema
8. Set up `.env.example` with all required variables documented
9. Configure Vitest for backend + frontend
10. Configure Playwright for E2E
11. Set up ESLint + Prettier across all packages
12. Set up GitHub Actions CI pipeline (lint, typecheck, test, migrate cycle, DB integration tests, build)
13. Create centralized error handling (AppError classes)
14. Create structured logger with request ID tracking
15. Create health check endpoint (`GET /api/v1/health`)
16. Write README with setup instructions

**Exit Gate (ALL must pass):**
- [x] `npm run typecheck` — 0 TypeScript errors across all packages
- [x] `npm run lint` — 0 ESLint errors across all packages
- [x] `npm run test` — test infrastructure runs (even if 0 tests)
- [x] `npm run migrate` — all migrations apply successfully
- [x] `npm run migrate:rollback` — all migrations reverse successfully
- [x] `npm run test:integration` — DB schema + health integration tests pass (with `RUN_DB_INTEGRATION=1`; see CI)
- [x] `npm run build` — production build for all packages
- [x] Health check endpoint returns 200 with DB connected
- [x] `.env.example` documents ALL required variables
- [x] README contains setup instructions that work from clean clone

**Evidence Required:** Terminal output of each gate command + pass/fail status logged.

**Phase 0 completion record:** **APPROVED / COMPLETE** — captured in `docs/evidence/phase-0-exit-gates.md`. Contract: `packages/shared/src/phase0-evidence-document.test.ts` (Vitest). Refresh evidence after gate changes: `npm run record:phase0-evidence` (from `project_scaffolding/`).

---

### Phase 1 — Auth + User Service (Days 4-7)

**Scope:** Registration, login, JWT, RBAC middleware for all 4 roles.

**TDD Order:**
1. **Types** — Define User, Role types in `packages/shared` (no tests needed — TypeScript validates)
2. **Repository tests (RED)** — `user.repository.test.ts`: create user, find by email, find by id
3. **Repository (GREEN)** — Implement user repository with parameterized queries
4. **Service tests (RED)** — `user.service.test.ts`: register (hash password, validate input), login (verify password, generate JWT), get profile
5. **Service (GREEN)** — Implement user service
6. **Auth middleware tests (RED)** — `auth.plugin.test.ts`: verify JWT, extract user, check role, reject expired token, reject wrong role
7. **Auth middleware (GREEN)** — Implement auth plugin
8. **Route tests (RED)** — `user.routes.test.ts` (Supertest): POST /register, POST /login, GET /me
9. **Routes (GREEN)** — Implement routes
10. **REFACTOR** — Extract common patterns, improve error messages

**Security Requirements (ref: MASTER_CHECKLIST Security section):**
- [ ] Passwords hashed with bcrypt (12 rounds minimum)
- [ ] Password strength validation (reject WEAK/FAIR)
- [ ] JWT secret validated at startup (32+ characters)
- [ ] JWT expiry: 15 minutes access token, 7 days refresh token
- [ ] Tokens stored in HTTP-only, secure, sameSite cookies
- [ ] User ID always from token, never from request body
- [ ] Roles never accepted from client input
- [ ] Rate limiting on login endpoint (5 attempts per 15 minutes)
- [ ] Generic error messages (no "user not found" vs "wrong password" distinction)
- [ ] Request ID in all error responses

**Exit Gate:**
- [ ] All auth tests pass (target: 30+ tests)
- [ ] Can register user with each of the 4 roles
- [ ] Can login and receive JWT
- [ ] Protected endpoints reject unauthenticated requests
- [ ] Role-based endpoints reject wrong roles
- [ ] Rate limiting blocks brute force on login
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run lint` — 0 errors
- [ ] Full test suite passes (no regressions)

**Evidence Required:** `npm test -- --reporter=verbose` output with test names + pass counts.

---

### Phase 2 — Parcel Service + State Machine (Days 8-12)

**Scope:** Parcel CRUD, 6-state lifecycle, manifest upload, postcode matching, status history.

**TDD Order:**
1. **Types** — Parcel, ParcelStatus, ParcelStatusHistory, ManifestRow in `packages/shared`
2. **State machine tests (RED)** — `parcel.stateMachine.test.ts`: valid transitions, invalid transitions, guard conditions
3. **State machine (GREEN)** — Implement state machine (which transitions are allowed from each state)
4. **Repository tests (RED)** — `parcel.repository.test.ts`: create, findById, findByCarrier, findByAffiliate, findByCustomer, updateStatus, addStatusHistory
5. **Repository (GREEN)** — Implement with parameterized queries
6. **Postcode matching tests (RED)** — `affiliate.service.test.ts`: match by exact postcode, handle no match, handle full capacity
7. **Postcode matching (GREEN)** — Implement matching logic
8. **Manifest parsing tests (RED)** — `carrier.service.test.ts`: parse valid CSV, reject invalid CSV, validate rows, auto-assign affiliates
9. **Manifest parsing (GREEN)** — Implement CSV parsing + bulk creation
10. **Route tests (RED)** — All parcel endpoints with auth + role checks
11. **Routes (GREEN)** — Implement routes
12. **REFACTOR**

**Parcel State Machine Rules:**

```
MANIFEST_RECEIVED  → IN_TRANSIT           (by: carrier)
IN_TRANSIT         → DROPPED_AT_AFFILIATE (by: carrier, affiliate)
DROPPED_AT_AFFILIATE → READY_TO_COLLECT   (by: system — auto on drop confirm)
READY_TO_COLLECT   → COLLECTED            (by: affiliate — on QR scan)
ANY_STATE          → EXCEPTION            (by: affiliate, ops)
EXCEPTION          → READY_TO_COLLECT     (by: ops — after resolution)
```

**Exit Gate:**
- [ ] All parcel tests pass (target: 50+ tests)
- [ ] Manifest upload creates parcels with correct state
- [ ] Postcode matching assigns correct Affiliate
- [ ] All valid state transitions work
- [ ] Invalid state transitions are rejected with clear error
- [ ] Status history records every transition with actor + timestamp
- [ ] Role-based access: carriers see only their parcels, customers see only theirs
- [ ] `npm run typecheck` + `npm run lint` — 0 errors
- [ ] Full test suite passes

---

### Phase 3 — QR Collection + Notification (Days 13-16)

**Scope:** QR token generation, QR validation on scan, email notifications on state change.

**TDD Order:**
1. **QR token service tests (RED)** — `qrToken.service.test.ts`: generate signed token, validate valid token, reject expired token, reject reused token, reject wrong affiliate
2. **QR token service (GREEN)** — JWT-based tokens with parcel_id, affiliate_id, expiry claims
3. **Collection service tests (RED)** — `collection.service.test.ts`: validate QR + transition to COLLECTED, record handover, create earning record
4. **Collection service (GREEN)** — Implement collection flow
5. **Notification service tests (RED)** — `notification.service.test.ts`: send email on READY_TO_COLLECT, send email on COLLECTED, handle send failure gracefully
6. **Notification service (GREEN)** — Implement with channel abstraction (email.channel.ts)
7. **Route tests (RED)** — Collection endpoint, notification triggers
8. **Routes (GREEN)** — Implement
9. **REFACTOR**

**QR Token Contract:**
- Signed JWT containing: `{ parcel_id, affiliate_id, customer_id, iat, exp }`
- Expiry: 7 days from generation
- Single-use: marked as used in database after successful collection
- Verification checks: signature valid, not expired, not already used, affiliate_id matches scanning affiliate

**Exit Gate:**
- [ ] All collection tests pass (target: 30+ tests)
- [ ] QR code generates for READY_TO_COLLECT parcels only
- [ ] QR scan completes collection successfully
- [ ] Expired QR tokens are rejected
- [ ] Reused QR tokens are rejected
- [ ] Wrong-affiliate QR tokens are rejected
- [ ] Email sends on state changes (verified in test with mock)
- [ ] Affiliate earning record created on collection
- [ ] Full test suite passes

---

### Phase 4 — Carrier Portal Frontend (Days 17-20)

**Scope:** Carrier web dashboard — login, manifest upload, parcel list, drop confirmation.

**TDD Order (frontend — ref: MASTER_GUIDELINES Testing UI Features section):**
1. **API service tests** — `parcel.service.test.ts`: mock API calls, verify request/response shapes
2. **Hook tests** — `useParcels.test.ts`: data fetching, loading states, error states
3. **Component tests** — `ManifestUpload.test.tsx`, `ParcelTable.test.tsx`, `StatusBadge.test.tsx`
4. **Page integration tests** — Render pages with mocked services, verify user flows
5. **E2E tests (Playwright)** — Carrier login → upload manifest → view parcels → confirm drop

**Exit Gate:**
- [ ] All frontend carrier tests pass (target: 25+ tests)
- [ ] Carrier can login and see dashboard
- [ ] Carrier can upload CSV manifest and see results
- [ ] Carrier can view parcel list with status badges
- [ ] Carrier can confirm drop (parcel transitions correctly)
- [ ] Unauthorized access redirects to login
- [ ] Loading and error states handled
- [ ] `npm run typecheck` + `npm run lint` — 0 errors
- [ ] E2E test: full carrier flow passes

---

### Phase 5 — Customer Portal Frontend (Days 21-24)

**Scope:** Customer PWA — register, parcel dashboard, QR code, Affiliate map.

**TDD Order:**
1. **API service tests** — Customer-specific API calls
2. **Hook tests** — `useCustomerParcels.test.ts`, `useAffiliate.test.ts`
3. **Component tests** — `ParcelCard.test.tsx`, `QRDisplay.test.tsx`, `AffiliateMap.test.tsx`
4. **Page integration tests**
5. **E2E tests** — Customer register → view parcels → view QR → see Affiliate on map

**Exit Gate:**
- [ ] All frontend customer tests pass (target: 25+ tests)
- [ ] Customer can register with postcode and see matched Affiliate
- [ ] Customer can view incoming parcels with status
- [ ] Customer can see QR code for READY_TO_COLLECT parcels
- [ ] Customer can see Affiliate location on map
- [ ] E2E test: full customer flow passes

---

### Phase 6 — Affiliate Portal Frontend (Days 25-28)

**Scope:** Affiliate web portal — register, parcel dashboard, receive parcel, QR scan handover, earnings.

**TDD Order:**
1. **API service tests** — Affiliate-specific API calls
2. **Hook tests** — `useAffiliateParcels.test.ts`, `useEarnings.test.ts`
3. **Component tests** — `ParcelReceive.test.tsx`, `QRScanner.test.tsx`, `EarningsSummary.test.tsx`
4. **Page integration tests**
5. **E2E tests** — Affiliate register → receive parcel → scan QR → see earnings

**Exit Gate:**
- [ ] All frontend affiliate tests pass (target: 30+ tests)
- [ ] Affiliate can register with address and capacity
- [ ] Affiliate can see today's expected and received parcels
- [ ] Affiliate can confirm parcel receipt
- [ ] Affiliate can scan customer QR and complete handover
- [ ] Affiliate can view earnings summary
- [ ] Invalid QR scans show clear error messages
- [ ] E2E test: full affiliate flow passes

---

### Phase 7 — Ops Console Frontend (Days 29-32)

**Scope:** Ops dashboard — stats, Affiliate map, parcel pipeline, manual assignment.

**TDD Order:**
1. **API service tests** — Ops-specific API calls
2. **Hook tests** — `useOpsStats.test.ts`, `useAffiliateMap.test.ts`
3. **Component tests** — `StatCards.test.tsx`, `AffiliateMap.test.tsx`, `ParcelPipeline.test.tsx`
4. **Page integration tests**
5. **E2E tests** — Ops login → view stats → view map → view parcels → reassign parcel

**Exit Gate:**
- [ ] All frontend ops tests pass (target: 25+ tests)
- [ ] Ops can see dashboard with live stats
- [ ] Ops can see all Affiliates on map with status colors
- [ ] Ops can view all parcels across all statuses
- [ ] Ops can manually assign/reassign parcel to different Affiliate
- [ ] E2E test: full ops flow passes

---

### Phase 8 — End-to-End Integration + Polish (Days 33-37)

**Scope:** Full parcel lifecycle E2E, demo seed data, UI polish, deployment.

**Tasks:**
1. **Golden path E2E test** — Full lifecycle: Carrier uploads manifest → parcel auto-assigned → carrier confirms drop → customer receives notification → customer views QR → Affiliate scans QR → parcel collected → Ops sees it all
2. **Exception path E2E test** — Damaged parcel reported → Ops resolves → customer re-notified
3. **Demo seed script** — Populate database with realistic London demo data (10 Affiliates across E1, SW9 postcodes, 3 carriers, 50 customers, 100 parcels in various states)
4. **UI polish** — Loading skeletons, empty states, error boundaries, responsive mobile views
5. **Security hardening** — CORS config, security headers (Helmet), input sanitization audit, SQL injection audit
6. **Deployment** — Deploy backend to Railway/Render, frontend to Vercel, configure production env vars
7. **Smoke test on production** — Run golden path manually on deployed system

**Exit Gate (FINAL — All Must Pass Before Demo):**
- [ ] Full test suite passes: `npm run test` — 0 failures
- [ ] Test count: 200+ tests minimum
- [ ] TypeScript: 0 errors across all packages
- [ ] ESLint: 0 errors across all packages
- [ ] E2E golden path: passes on deployed production
- [ ] E2E exception path: passes on deployed production
- [ ] All 4 portals accessible and functional
- [ ] Demo seed data loaded and visually impressive
- [ ] Health check endpoint returns 200
- [ ] No console errors in browser
- [ ] Security headers verified (check via securityheaders.com)
- [ ] HTTPS enforced
- [ ] Rate limiting active on auth endpoints

---

## 10. TDD Workflow & Quality Gates

*Adapted from Sekhmira TDD_WORKFLOW.md and MASTER_GUIDELINES TDD section*

### The Three Laws (Non-Negotiable)

1. You MUST write a failing test before writing production code
2. You MUST NOT write more of a test than is sufficient to fail
3. You MUST NOT write more production code than is sufficient to pass the test

### TDD Cycle: RED-GREEN-REFACTOR

**RED Phase:**
1. Create test file BEFORE implementation file
2. Write test cases describing expected behavior
3. Run test — it MUST fail
4. Verify failure is for the right reason (module not found, function undefined — NOT a passing test)

**GREEN Phase:**
1. Write the simplest code to make the test pass
2. Do not add extra features or optimize
3. Run test — it MUST pass

**REFACTOR Phase:**
1. Improve code quality (extract functions, improve naming, add error handling)
2. Run ALL tests — they MUST still pass
3. Run quality gates (see below)

### Implementation Order (Per Feature)

1. **Types first** (no tests — TypeScript validates at compile time)
2. **Repository layer** (test first — data access)
3. **Service layer** (test first — business logic)
4. **Route/Controller layer** (test first — HTTP handling)
5. **Frontend API service** (test first — API calls)
6. **Frontend hooks** (test first — state management)
7. **Frontend components** (test first — UI rendering)
8. **Frontend pages** (integration test — user flows)
9. **E2E tests** (golden path flows)

### Gold Standard Quality Gates (Run After Every Phase)

```bash
# 1. All tests pass
npm run test
# Expected: X tests passing, 0 failures

# 2. TypeScript compiles
npm run typecheck
# Expected: 0 errors

# 3. Linter passes
npm run lint
# Expected: 0 errors

# 4. Coverage maintained
npm run test:coverage
# Expected: >= 90% on all metrics
```

**All four MUST pass before moving to next phase. No exceptions.**

---

## 11. Testing Strategy

*Adapted from test-suite-system-prompt.md and MASTER_CHECKLIST Testing section*

### Test Pyramid

| Layer | Percentage | Speed | Scope |
|-------|-----------|-------|-------|
| Unit tests | 60-70% | <1ms each | Individual functions, services, utilities |
| Integration tests | 20-30% | 10-100ms each | API endpoints, DB operations, service interactions |
| E2E tests | 5-10% | 1-10s each | Complete user journeys across portals |

### Test Naming Convention

```
[MODULE]_[SCENARIO]_[EXPECTED_RESULT]
```

Examples:
- `PARCEL_ValidManifestUpload_CreatesParcelRecords`
- `AUTH_ExpiredToken_Returns401`
- `QR_AlreadyUsedToken_RejectsCollection`
- `AFFILIATE_FullCapacity_ExcludedFromMatching`

### Priority Classification

- **P0 (Critical):** Parcel state transitions, QR validation, auth/authorization, data integrity
- **P1 (High):** Input validation, manifest parsing, postcode matching, notification sending
- **P2 (Medium):** UI rendering, stats calculations, map display, earnings calculations
- **P3 (Low):** Empty states, loading animations, cosmetic issues

### Mandatory Test Categories Per Feature

For EVERY feature, tests MUST cover:

1. **Happy Path** — Standard expected behavior
2. **Negative/Failure** — Invalid inputs, unauthorized access, network failures
3. **Edge Cases** — Empty data, boundary values, concurrent operations
4. **Data Integrity** — State consistency after operations, audit trail completeness
5. **Security** — Auth bypass attempts, role escalation, injection attempts

### Backend Test Infrastructure

```typescript
// tests/helpers/index.ts — Shared test utilities
export const createTestUser = async (role: UserRole) => { ... };
export const createTestAffiliate = async (postcode: string) => { ... };
export const createTestParcel = async (status: ParcelStatus) => { ... };
export const getAuthToken = async (user: User) => { ... };
export const cleanupTestData = async () => { ... };
```

### Frontend Test Infrastructure

```typescript
// src/__tests__/setup.ts — Global mocks
// Mock API service
// Mock router
// Mock map component (Leaflet doesn't render in jsdom)
// Mock QR scanner
```

---

## 12. Security & Production Readiness from Day 1

*Ref: MASTER_CHECKLIST Security section, MASTER_GUIDELINES Security-First Principle*

### Authentication & Authorization (Phase 1)

- [ ] Passwords hashed with bcrypt (12+ rounds)
- [ ] JWT tokens with 15-minute expiry
- [ ] Refresh token rotation (7-day expiry)
- [ ] HTTP-only, secure, sameSite cookies
- [ ] User ID from token only (never request body)
- [ ] Role-based access control middleware
- [ ] Resource-level authorization (users access own data only)
- [ ] Rate limiting on auth endpoints (5/15min)

### Input Validation (Every Endpoint)

- [ ] All inputs validated with Zod schemas
- [ ] Email format validated
- [ ] UUID format validated
- [ ] String length limits (prevent DoS)
- [ ] Array length limits
- [ ] Postcode format validated (UK format)
- [ ] Enum values validated against whitelist
- [ ] Validation occurs before business logic

### SQL Injection Prevention (Every Query)

- [ ] Parameterized queries only ($1, $2 — no string concatenation)
- [ ] Field names whitelisted for dynamic queries
- [ ] Table/column names hardcoded (never from user input)

### Error Handling (Centralized)

- [ ] Custom error classes (AppError, ValidationError, NotFoundError, UnauthorizedError)
- [ ] Generic error messages to clients
- [ ] Detailed errors logged internally (with request ID, user ID, endpoint)
- [ ] Stack traces never exposed in production
- [ ] Database structure never revealed in errors

### Logging (Structured from Day 1)

- [ ] Pino structured logger (JSON format)
- [ ] Request ID generated per request
- [ ] Request ID in all logs and error responses
- [ ] Log levels: debug (dev only), info, warn, error
- [ ] No console.log statements
- [ ] Secrets never logged
- [ ] PII masked in logs (email partially masked)

### Security Headers

- [ ] CORS restricted to frontend URL only
- [ ] Helmet.js (or Fastify equivalent) for security headers
- [ ] Content-Security-Policy configured
- [ ] Strict-Transport-Security configured
- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options set to nosniff

### GDPR Compliance Foundations (UK Market)

- [ ] Data minimisation: drivers see only Affiliate address, not customer details
- [ ] Customer address never exposed to Affiliate (only QR code + first name)
- [ ] Right to erasure: soft delete endpoint for user accounts (30-day grace)
- [ ] All PII stored in single geographic region (UK/EU hosting)
- [ ] Privacy policy endpoint/page stub (content in Phase 2)

### Configuration Safety

- [ ] All env vars validated at startup (fail fast on missing/weak values)
- [ ] JWT secret validated for minimum length (32+ chars)
- [ ] Database URL validated
- [ ] `.env` in `.gitignore`
- [ ] `.env.example` with all variables documented

---

## 13. Stage Gate Rules

*Adapted from HISTORICALS implementation plan and CRITICAL_E2E_AUDIT_PROMPT.md*

### Rule 1: No Phase Advancement Without Gate Passage

Each phase has an explicit exit gate. ALL gate conditions must be met before starting the next phase. No exceptions, no "we'll fix it later."

### Rule 2: Evidence Logging Required

Every gate passage must be evidenced with:
- Terminal output of `npm run test` with pass counts
- Terminal output of `npm run typecheck` with 0 errors
- Terminal output of `npm run lint` with 0 errors
- For E2E phases: screenshot or log of E2E test passing

### Rule 3: TDD Compliance

Every feature implementation must follow RED → GREEN → REFACTOR. If a test doesn't fail first during the RED phase, the test is invalid and must be rewritten.

### Rule 4: No Regressions

Full test suite must pass at every gate. If a new feature breaks an existing test, the breakage must be fixed before the gate can pass. Never comment out or skip failing tests.

### Rule 5: Issue Logging

Every issue encountered during implementation must be logged in `docs/ISSUE_LOG.md` with:
- What went wrong
- Root cause
- How it was fixed
- How to avoid it in future

### Rule 6: Security Review Per Phase

Each phase's exit gate includes a security sub-check:
- Are all new endpoints authenticated?
- Are all inputs validated?
- Are all queries parameterized?
- Are errors generic to clients?
- Is logging structured (no console.log)?

### Rule 7: Database-First Development

Schema changes (migrations) must be created and verified BEFORE writing service code that depends on them. Never write application code against an assumed schema.

### Rule 8: Backend Before Frontend

For each feature, the complete backend (repository → service → route + tests) must be done and passing before starting the frontend for that feature. Frontend tests mock the API service, but the API contract must be real.

---

## 14. Policy Decisions Required

*Following HISTORICALS pattern — these must be decided before implementation starts*

| # | Decision | Approved Choice | Status |
|---|----------|----------------|--------|
| 1 | Per-parcel Affiliate fee | Configurable per carrier agreement (default £0.50), stored in DB | **LOCKED** |
| 2 | QR token expiry window | 7 days from generation | **LOCKED** |
| 3 | Postcode matching strategy | Exact postcode match only (e.g. SW9 8xx → SW9 Affiliate); geo-radius deferred to Phase 2 | **LOCKED** |
| 4 | Affiliate verification | Ops must manually approve each Affiliate before they can receive parcels | **LOCKED** |
| 5 | No Affiliate available for postcode | Mark parcel as 'unmatched' — Ops manually assigns later from Ops console | **LOCKED** |
| 6 | Manifest upload format | CSV only (`carrier_ref,recipient_name,recipient_postcode,recipient_email,estimated_drop_time`) | **LOCKED** |
| 7 | Exception handling | Affiliate reports → Ops gets notified → 24hr SLA timer displayed in Ops console | **LOCKED** |
| 8 | Demo postcodes | **DEFERRED** — to be decided before demo seed data is created (Phase 8) | **DEFERRED** |
| 9 | Parcel retention period | Indefinite for MVP (no auto-cleanup) | **LOCKED** |
| 10 | Notification channel | Email only for MVP; push + SMS deferred to Phase 2 | **LOCKED** |
| 11 | Photo proof storage | Local file storage on server for MVP; S3 in Phase 2 | **LOCKED** |
| 12 | Multi-carrier manifests per day | Unlimited — carriers can upload multiple manifests per day | **LOCKED** |

**Decision gate status: 11/12 LOCKED, 1/12 DEFERRED (non-blocking for Phase 0-7).**
**Implementation may begin — deferred decision (Q8) only blocks Phase 8 seed data.**

**Sign-off — Phase 0–7 entry:** Policy rows above are **approved** for implementation through Phase 7. The single **DEFERRED** row (Q8 — demo postcodes) must be resolved before Phase 8 demo seed data.

**Sign-off — Phase 0 exit (foundation):** Infrastructure exit gates (§9 Phase 0) are **verified** with recorded command output in `docs/evidence/phase-0-exit-gates.md`.

---

## 15. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| QR scanner unreliable in mobile browser | High | Medium | Provide manual entry fallback; test on multiple devices before demo |
| Map component performance on low-end devices | Medium | Low | Use Leaflet (lightweight); limit markers shown; lazy-load map |
| CSV parsing edge cases (encoding, special chars) | Medium | Medium | Comprehensive validation tests; use Papa Parse library; reject invalid rows with clear errors |
| Demo data doesn't look realistic | Medium | Low | Create detailed seed script with real London postcodes, realistic names, varied parcel states |
| PostgreSQL connection limits on free tier | Low | Medium | Connection pooling from day 1; monitor pool usage; upgrade tier if needed |
| Grant reviewer tests on mobile | Medium | High | PWA must work on mobile Safari + Chrome; test responsive design on real devices |
| Email delivery to spam | Medium | Medium | Use Resend (good deliverability); configure SPF/DKIM; test with real email addresses |

---

## 16. Definition of Done

### A feature is "done" when:

1. All tests written and passing (RED → GREEN → REFACTOR completed)
2. Code coverage >= 90% for that feature's files
3. TypeScript strict mode passes (0 errors)
4. ESLint passes (0 errors)
5. All security checklist items for that feature verified
6. Input validation on all new endpoints
7. Error handling returns generic messages to clients
8. Structured logging added for important operations
9. Loading states handled in UI
10. Error states handled in UI
11. Empty states handled in UI
12. Responsive design works on mobile viewport
13. No console.log statements
14. No hardcoded secrets
15. Documentation updated (if API contract changed)

### The MVP is "demo-ready" when:

1. All 8 phases' exit gates have passed with evidence
2. Full E2E golden path works on deployed production
3. Demo seed data loaded and visually compelling
4. All 4 portals accessible and functional
5. No console errors in any portal
6. Security headers verified
7. HTTPS enforced
8. Grant reviewer can walk through the full parcel lifecycle without assistance

---

## 17. Expansion-Ready Architecture Contracts

These interfaces/abstractions are defined in the MVP codebase but use simple implementations. Phase 2+ swaps in production implementations without changing business logic.

### Storage Interface (MVP: base64 in DB → Phase 2: S3)

```typescript
interface IStorageService {
  upload(key: string, data: Buffer, contentType: string): Promise<string>; // returns URL
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}
```

### Cache Interface (MVP: in-memory Map → Phase 2: Redis)

```typescript
interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}
```

### Event Bus Interface (MVP: local EventEmitter → Phase 2: SQS/SNS)

```typescript
interface IEventBus {
  publish(event: string, payload: Record<string, unknown>): Promise<void>;
  subscribe(event: string, handler: (payload: Record<string, unknown>) => Promise<void>): void;
}
```

### Notification Channel Interface (MVP: email → Phase 2: + push + SMS)

```typescript
interface INotificationChannel {
  send(recipient: string, subject: string, body: string, metadata?: Record<string, unknown>): Promise<void>;
}
```

### Carrier Gateway Interface (MVP: manual Tier 3 → Phase 2: API Tier 1/2)

```typescript
interface ICarrierGateway {
  parseManifest(data: Buffer, format: 'csv' | 'json' | 'edi'): Promise<ManifestRow[]>;
  sendStatusUpdate(carrierRef: string, status: ParcelStatus): Promise<void>;
  validateWebhook(payload: unknown, signature: string): boolean;
}
```

### Identity Verification Interface (MVP: auto-approve → Phase 2: Onfido)

```typescript
interface IIdentityVerifier {
  startVerification(userId: string, documentType: string): Promise<{ verificationId: string }>;
  checkStatus(verificationId: string): Promise<VerificationResult>;
}
```

### Payment Interface (MVP: mock earnings → Phase 2: Stripe Connect)

```typescript
interface IPaymentService {
  createConnectedAccount(affiliateId: string, bankDetails: BankDetails): Promise<string>;
  createPayout(affiliateId: string, amount: number, currency: string): Promise<PayoutResult>;
  getPayoutHistory(affiliateId: string): Promise<Payout[]>;
}
```

---

## Appendix A: Key Learnings Incorporated

| Source Document | Key Learning Applied |
|----------------|---------------------|
| MASTER_GUIDELINES | "Building correctly from the start takes 20% more time initially but saves 70% overall" — applied to all architecture decisions |
| MASTER_GUIDELINES | Security-first principle — auth, validation, parameterized queries from Phase 1 |
| MASTER_GUIDELINES | Database-first, backend-before-frontend development order |
| MASTER_GUIDELINES | Layered architecture: routes → services → repositories |
| MASTER_CHECKLIST | Day 1 foundation checklist — folder structure, .gitignore, .env.example, logging, security headers |
| MASTER_CHECKLIST | Complete testing pyramid with specific coverage targets |
| MASTER_CHECKLIST | Pre-deployment checklist items built into Phase 8 gate |
| CRITICAL_E2E_AUDIT | Validate against live database/schema first |
| CRITICAL_E2E_AUDIT | Policy decision gates before implementation |
| CRITICAL_E2E_AUDIT | Evidence logging per gate |
| HISTORICALS plan | Phased implementation with explicit exit gates and closeout status |
| HISTORICALS plan | Manual tester checklists per phase |
| HISTORICALS plan | Decision lock table pattern for policy approvals |
| HISTORICALS plan | TDD RED → GREEN → REFACTOR per phase with test count evidence |
| test-suite-system-prompt | Test naming convention: MODULE_SCENARIO_EXPECTEDRESULT |
| test-suite-system-prompt | Priority classification: P0/P1/P2/P3 |
| test-suite-system-prompt | Mandatory test categories: happy path, negative, edge case, data integrity, regression |
| Sekhmira IMPLEMENTATION_PLAN | Clean architecture layers: presentation → hooks → services → storage |
| Sekhmira IMPLEMENTATION_PLAN | Feature-oriented folder structure with co-located tests |
| Sekhmira IMPLEMENTATION_PLAN | Shared types package, storage keys constants |
| Sekhmira TDD_WORKFLOW | Gold standard quality gates (test + typecheck + lint + coverage) |
| Sekhmira TDD_WORKFLOW | Implementation order: types → storage → hooks → components → screens |
| Sekhmira TDD_WORKFLOW | 90% coverage threshold enforced in config (elevated from Sekhmira's 75%) |
| Sekhmira TDD_WORKFLOW | Pre-commit checklist with zero-tolerance for failures |

---

## Appendix B: Mobile App Phase 2 Architecture (Sekhmira Pattern)

When building the standalone React Native Affiliate app in Phase 2, follow this architecture exactly:

```
apps/mobile-affiliate/
├── App.tsx
├── app.json
├── package.json
├── tsconfig.json                   # Strict mode, extends base
├── jest.config.js                  # 90% coverage threshold
├── babel.config.js                 # Module resolver: @ → src/
├── src/
│   ├── __tests__/
│   │   └── setup.ts               # Global mocks (AsyncStorage, Expo, Navigation)
│   ├── navigation/
│   │   └── AppNavigator.tsx        # Bottom tabs: Dashboard, Scan, Parcels, Earnings
│   ├── screens/
│   │   ├── __tests__/
│   │   ├── DashboardScreen.tsx
│   │   ├── ScanScreen.tsx
│   │   ├── ParcelsScreen.tsx
│   │   └── EarningsScreen.tsx
│   ├── components/
│   │   ├── __tests__/
│   │   ├── common/                 # Button, Card, StatusBadge
│   │   └── affiliate/             # ParcelCard, QRScanner, EarningRow
│   ├── hooks/
│   │   ├── __tests__/
│   │   ├── useAuth.ts
│   │   ├── useParcels.ts
│   │   ├── useScanner.ts
│   │   └── useEarnings.ts
│   ├── services/
│   │   ├── __tests__/
│   │   └── api.ts                  # Same API contract as web, using fetch
│   ├── utils/
│   │   └── storage/
│   │       └── secureStorage.ts    # expo-secure-store for tokens
│   ├── constants/
│   │   ├── Colors.ts
│   │   ├── Theme.ts
│   │   └── Config.ts
│   └── types/                      # Imports from packages/shared
```

**Key principle:** The mobile app consumes the EXACT same backend API as the web Affiliate portal. Zero backend changes required.

---

**Document Version:** 1.0
**Created:** April 1, 2026
**Author:** AI Assistant based on NearDrop architecture doc + all reference materials
**Next Step:** Begin **Phase 1 — Auth + User Service** (§9). Phase 0 foundation is complete; policy table (§14) is approved for Phases 0–7 with Q8 deferred until Phase 8 prep.
