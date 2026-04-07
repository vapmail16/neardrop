# Phase 0 exit gate evidence

**Recorded:** 2026-04-04T17:13Z  
**Repository:** NearDrop monorepo  
**Git commit:** `02ac5ee25c0aeccf9582b7bcebba049b27332c63`  
**Plan reference:** `docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md` §9 Phase 0 exit gate.

Commands run from repo root. Root `.env` supplies `DATABASE_URL` (Knex and API load monorepo `loadMonorepoDotenv`).

---

## GATE: typecheck
status: PASS

Command: `npm run typecheck`

```

> typecheck
> turbo run typecheck


   • Packages in scope: @neardrop/api, @neardrop/shared, @neardrop/web
   • Running typecheck in 3 packages
   • Remote caching disabled

@neardrop/shared:build: cache hit, replaying logs 3ca1a5078d13a0fa
@neardrop/shared:build: 
@neardrop/shared:build: > @neardrop/shared@0.0.0 build
@neardrop/shared:build: > tsc -p tsconfig.build.json
@neardrop/shared:build: 
@neardrop/shared:typecheck: cache hit, replaying logs 1cad55e386cc8a48
@neardrop/shared:typecheck: 
@neardrop/shared:typecheck: > @neardrop/shared@0.0.0 typecheck
@neardrop/shared:typecheck: > tsc -p tsconfig.json --noEmit
@neardrop/shared:typecheck: 
@neardrop/api:typecheck: cache miss, executing 377c41e8c416652c
@neardrop/web:typecheck: cache hit, replaying logs cfd22c6cf05c8a45
@neardrop/web:typecheck: 
@neardrop/web:typecheck: > @neardrop/web@0.0.0 typecheck
@neardrop/web:typecheck: > tsc -p tsconfig.json --noEmit
@neardrop/web:typecheck: 
@neardrop/api:typecheck: 
@neardrop/api:typecheck: > @neardrop/api@0.0.0 typecheck
@neardrop/api:typecheck: > tsc -p tsconfig.json --noEmit
@neardrop/api:typecheck: 

 Tasks:    4 successful, 4 total
Cached:    3 cached, 4 total
  Time:    2.644s 

```

---

## GATE: lint
status: PASS

Command: `npm run lint`

```

> lint
> turbo run lint


   • Packages in scope: @neardrop/api, @neardrop/shared, @neardrop/web
   • Running lint in 3 packages
   • Remote caching disabled

@neardrop/api:lint: cache miss, executing d8f3824f8c0124ce
@neardrop/web:lint: cache hit, replaying logs 4328d9d48ca97ba4
@neardrop/web:lint: 
@neardrop/web:lint: > @neardrop/web@0.0.0 lint
@neardrop/web:lint: > eslint -c ../../eslint.config.js "src/**/*.{ts,tsx}" "middleware.ts" "playwright.config.mjs"
@neardrop/web:lint: 
@neardrop/shared:lint: cache hit, replaying logs 77491e6aeff96d0d
@neardrop/shared:lint: 
@neardrop/shared:lint: > @neardrop/shared@0.0.0 lint
@neardrop/shared:lint: > eslint -c ../../eslint.config.js "src/**/*.ts"
@neardrop/shared:lint: 
@neardrop/api:lint: 
@neardrop/api:lint: > @neardrop/api@0.0.0 lint
@neardrop/api:lint: > eslint -c ../../eslint.config.js "src/**/*.ts"
@neardrop/api:lint: 

 Tasks:    3 successful, 3 total
Cached:    2 cached, 3 total
  Time:    1.792s 

```

---

## GATE: test
status: PASS

Command: `npm run test`

```

> test
> turbo run test


   • Packages in scope: @neardrop/api, @neardrop/shared, @neardrop/web
   • Running test in 3 packages
   • Remote caching disabled

@neardrop/shared:test: cache hit, replaying logs 011d5641930feb1c
@neardrop/shared:build: cache hit, replaying logs 3ca1a5078d13a0fa
@neardrop/shared:build: 
@neardrop/shared:build: > @neardrop/shared@0.0.0 build
@neardrop/shared:build: > tsc -p tsconfig.build.json
@neardrop/shared:build: 
@neardrop/shared:test: 
@neardrop/shared:test: > @neardrop/shared@0.0.0 test
@neardrop/shared:test: > vitest run
@neardrop/shared:test: 
@neardrop/shared:test: 
@neardrop/shared:test:  RUN  v2.1.9 /Users/niteshrav/Documents/ContextFirstAI_Projects/NearDrop/project_scaffolding/packages/shared
@neardrop/shared:test: 
@neardrop/shared:test:  ✓ src/utils/password.test.ts (7 tests) 3ms
@neardrop/shared:test:  ✓ src/utils/validators.test.ts (3 tests) 2ms
@neardrop/shared:test:  ✓ src/phase0-evidence-document.test.ts (2 tests) 8ms
@neardrop/shared:test:  ✓ src/validation/schemas.test.ts (15 tests) 8ms
@neardrop/shared:test: 
@neardrop/shared:test:  Test Files  4 passed (4)
@neardrop/shared:test:       Tests  27 passed (27)
@neardrop/shared:test:    Start at  21:32:13
@neardrop/shared:test:    Duration  533ms (transform 161ms, setup 0ms, collect 214ms, tests 21ms, environment 0ms, prepare 477ms)
@neardrop/shared:test: 
@neardrop/api:test: cache hit, replaying logs 7fac5dd5b0116af6
@neardrop/web:test: cache hit, replaying logs 2e4c1fe27b2abe94
@neardrop/api:test: 
@neardrop/api:test: > @neardrop/api@0.0.0 test
@neardrop/api:test: > vitest run
@neardrop/api:test: 
@neardrop/api:test: 
@neardrop/api:test:  RUN  v2.1.9 /Users/niteshrav/Documents/ContextFirstAI_Projects/NearDrop/project_scaffolding/apps/api
@neardrop/api:test: 
@neardrop/api:test:  ✓ src/services/parcel.stateMachine.test.ts (14 tests) 19ms
@neardrop/api:test:  ✓ src/services/notification.service.test.ts (4 tests) 7ms
@neardrop/api:test:  ✓ src/services/user.service.test.ts (6 tests) 34ms
@neardrop/api:test:  ✓ src/config/dotenv.test.ts (3 tests) 19ms
@neardrop/api:test:  ↓ src/routes/parcel.phase2.integration.test.ts (1 test | 1 skipped)
@neardrop/api:test:  ↓ src/routes/auth.flow.integration.test.ts (3 tests | 3 skipped)
@neardrop/api:test:  ↓ src/routes/affiliates.integration.test.ts (2 tests | 2 skipped)
@neardrop/api:test:  ↓ src/routes/parcel.phase3.integration.test.ts (1 test | 1 skipped)
@neardrop/api:test:  ✓ src/services/qr-token.service.test.ts (5 tests) 44ms
@neardrop/api:test: {"level":30,"time":1775322732203,"pid":82018,"hostname":"MacBookAir.lan","reqId":"12a4a260-9d8a-4bda-843e-5bf3b657e3bc","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test: {"level":30,"time":1775322732291,"pid":82018,"hostname":"MacBookAir.lan","reqId":"415fe41c-fcdc-436a-971f-c53ee621db2c","req":{"method":"POST","url":"/api/v1/auth/login","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test: {"level":30,"time":1775322732249,"pid":82018,"hostname":"MacBookAir.lan","reqId":"12a4a260-9d8a-4bda-843e-5bf3b657e3bc","res":{"statusCode":200},"responseTime":45.16354203224182,"msg":"request completed"}
@neardrop/api:test: {"level":30,"time":1775322732293,"pid":82018,"hostname":"MacBookAir.lan","reqId":"415fe41c-fcdc-436a-971f-c53ee621db2c","res":{"statusCode":401},"responseTime":2.2204580307006836,"msg":"request completed"}
@neardrop/api:test: {"level":30,"time":1775322732297,"pid":82018,"hostname":"MacBookAir.lan","reqId":"b8c03fdc-f6b4-47e1-8917-c0b50a2a00d7","req":{"method":"GET","url":"/api/v1/auth/me","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test: {"level":30,"time":1775322732298,"pid":82018,"hostname":"MacBookAir.lan","reqId":"b8c03fdc-f6b4-47e1-8917-c0b50a2a00d7","res":{"statusCode":401},"responseTime":0.39441704750061035,"msg":"request completed"}
@neardrop/api:test:  ✓ src/routes/auth.test.ts (3 tests) 153ms
@neardrop/api:test:  ↓ src/database/schema.integration.test.ts (3 tests | 3 skipped)
@neardrop/api:test: {"level":30,"time":1775322732664,"pid":82029,"hostname":"MacBookAir.lan","reqId":"09a4bf6f-7e2d-4a17-8b2e-30af49fa05fa","req":{"method":"GET","url":"/t","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/web:test: 
@neardrop/web:test: > @neardrop/web@0.0.0 test
@neardrop/web:test: > vitest run
@neardrop/web:test: 
@neardrop/api:test:  ↓ src/repositories/user.repository.integration.test.ts (1 test | 1 skipped)
@neardrop/api:test: {"level":30,"time":1775322732741,"pid":82029,"hostname":"MacBookAir.lan","reqId":"1447f915-0fd4-49ad-ad36-c21c557d232e","req":{"method":"GET","url":"/t","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test: {"level":30,"time":1775322732759,"pid":82029,"hostname":"MacBookAir.lan","reqId":"14f90932-b69b-49f6-9038-7a05b3571281","req":{"method":"GET","url":"/t","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test:  ✓ src/plugins/auth.test.ts (3 tests) 210ms
@neardrop/api:test: {"level":30,"time":1775322732700,"pid":82029,"hostname":"MacBookAir.lan","reqId":"09a4bf6f-7e2d-4a17-8b2e-30af49fa05fa","res":{"statusCode":200},"responseTime":35.0564169883728,"msg":"request completed"}
@neardrop/api:test: {"level":30,"time":1775322732748,"pid":82029,"hostname":"MacBookAir.lan","reqId":"1447f915-0fd4-49ad-ad36-c21c557d232e","res":{"statusCode":200},"responseTime":7.278167009353638,"msg":"request completed"}
@neardrop/api:test: {"level":30,"time":1775322732761,"pid":82029,"hostname":"MacBookAir.lan","reqId":"14f90932-b69b-49f6-9038-7a05b3571281","res":{"statusCode":401},"responseTime":2.2107081413269043,"msg":"request completed"}
@neardrop/api:test:  ✓ src/services/manifest.service.test.ts (5 tests) 16ms
@neardrop/api:test:  ✓ src/services/token.service.test.ts (5 tests) 13ms
@neardrop/api:test: {"level":30,"time":1775322733133,"pid":82051,"hostname":"MacBookAir.lan","reqId":"807f9842-020b-4a82-857f-560ef90acbb6","req":{"method":"GET","url":"/api/v1/health","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test:  ↓ src/routes/health.db.integration.test.ts (1 test | 1 skipped)
@neardrop/api:test: {"level":30,"time":1775322733150,"pid":82051,"hostname":"MacBookAir.lan","reqId":"91cb2a40-c762-4aa6-bd21-2f4e350abc65","req":{"method":"GET","url":"/api/v1/health","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test:  ✓ src/routes/health.test.ts (2 tests) 113ms
@neardrop/api:test: {"level":30,"time":1775322733141,"pid":82051,"hostname":"MacBookAir.lan","reqId":"807f9842-020b-4a82-857f-560ef90acbb6","res":{"statusCode":200},"responseTime":6.926167011260986,"msg":"request completed"}
@neardrop/api:test: {"level":30,"time":1775322733151,"pid":82051,"hostname":"MacBookAir.lan","reqId":"91cb2a40-c762-4aa6-bd21-2f4e350abc65","res":{"statusCode":503},"responseTime":0.7269580364227295,"msg":"request completed"}
@neardrop/api:test: {"level":30,"time":1775322733163,"pid":82053,"hostname":"MacBookAir.lan","reqId":"1ffcee6f-2d0b-47eb-9813-f7e10b9e51fc","req":{"method":"GET","url":"/api/v1/auth/ops-ping","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test: {"level":30,"time":1775322733190,"pid":82053,"hostname":"MacBookAir.lan","reqId":"aff65b9d-abc6-4862-b073-db448af1778f","req":{"method":"GET","url":"/api/v1/auth/ops-ping","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test: {"level":30,"time":1775322733198,"pid":82053,"hostname":"MacBookAir.lan","reqId":"acb23530-f558-4e54-a6c0-a0a893ecfd60","req":{"method":"GET","url":"/api/v1/auth/ops-ping","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test: {"level":30,"time":1775322733175,"pid":82053,"hostname":"MacBookAir.lan","reqId":"1ffcee6f-2d0b-47eb-9813-f7e10b9e51fc","res":{"statusCode":403},"responseTime":11.881250143051147,"msg":"request completed"}
@neardrop/api:test: {"level":30,"time":1775322733191,"pid":82053,"hostname":"MacBookAir.lan","reqId":"aff65b9d-abc6-4862-b073-db448af1778f","res":{"statusCode":200},"responseTime":0.8998751640319824,"msg":"request completed"}
@neardrop/api:test: {"level":30,"time":1775322733199,"pid":82053,"hostname":"MacBookAir.lan","reqId":"acb23530-f558-4e54-a6c0-a0a893ecfd60","res":{"statusCode":401},"responseTime":0.38916707038879395,"msg":"request completed"}
@neardrop/api:test:  ✓ src/routes/auth.rbac.test.ts (3 tests) 70ms
@neardrop/web:test: 
@neardrop/web:test:  RUN  v2.1.9 /Users/niteshrav/Documents/ContextFirstAI_Projects/NearDrop/project_scaffolding/apps/web
@neardrop/web:test: 
@neardrop/web:test:  ✓ src/lib/api/parcel.service.test.ts (6 tests) 7ms
@neardrop/web:test:  ✓ src/lib/server/fetch-me-user.test.ts (9 tests) 17ms
@neardrop/web:test:  ✓ src/lib/hooks/useParcels.test.tsx (4 tests) 356ms
@neardrop/web:test:  ✓ src/app/carrier/dashboard/CarrierDashboardClient.integration.test.tsx (5 tests) 1275ms
@neardrop/web:test:    ✓ CarrierDashboardClient (integration) > shows error alert 484ms
@neardrop/web:test:    ✓ CarrierDashboardClient (integration) > links to manifests and parcels 554ms
@neardrop/web:test:  ✓ src/app/carrier/parcels/CarrierParcelsClient.integration.test.tsx (3 tests) 1171ms
@neardrop/api:test:  ✓ src/config/index.test.ts (4 tests) 20ms
@neardrop/api:test:  ✓ src/services/affiliate-matching.service.test.ts (3 tests) 7ms
@neardrop/api:test: {"level":30,"time":1775322733599,"pid":82085,"hostname":"MacBookAir.lan","reqId":"eaec11da-f467-499f-b6b6-b96da90df6ac","req":{"method":"POST","url":"/api/v1/auth/login","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test: {"level":30,"time":1775322733608,"pid":82085,"hostname":"MacBookAir.lan","reqId":"eaec11da-f467-499f-b6b6-b96da90df6ac","res":{"statusCode":401},"responseTime":8.251667022705078,"msg":"request completed"}
@neardrop/api:test: {"level":30,"time":1775322733608,"pid":82085,"hostname":"MacBookAir.lan","reqId":"a5250b5f-2c75-4a17-8a15-25b07fe7dcab","req":{"method":"POST","url":"/api/v1/auth/login","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/web:test:    ✓ CarrierParcelsClient (integration) > passes status filter into useParcels when user selects a status 1091ms
@neardrop/api:test: {"level":30,"time":1775322733610,"pid":82085,"hostname":"MacBookAir.lan","reqId":"a5250b5f-2c75-4a17-8a15-25b07fe7dcab","res":{"statusCode":401},"responseTime":1.5707919597625732,"msg":"request completed"}
@neardrop/web:test:  ✓ src/app/(auth)/register/RegisterForm.test.tsx (2 tests) 1916ms
@neardrop/web:test:    ✓ RegisterForm > submits carrier registration 1579ms
@neardrop/web:test:    ✓ RegisterForm > shows error on failure 335ms
@neardrop/web:test:  ✓ src/app/(auth)/login/LoginForm.test.tsx (3 tests) 1858ms
@neardrop/web:test:    ✓ LoginForm > submits and redirects carrier to returnTo 1422ms
@neardrop/web:test:  ✓ src/lib/api/client.test.ts (4 tests) 12ms
@neardrop/web:test:  ✓ src/lib/api/affiliates.test.ts (3 tests) 39ms
@neardrop/web:test:  ✓ src/components/carrier/ParcelTable.test.tsx (3 tests) 1131ms
@neardrop/web:test:    ✓ ParcelTable > calls patch when carrier action clicked 1000ms
@neardrop/web:test:  ✓ src/components/carrier/ManifestUploadForm.test.tsx (3 tests) 1694ms
@neardrop/web:test:    ✓ ManifestUploadForm > disables submit when empty 751ms
@neardrop/web:test:    ✓ ManifestUploadForm > submits CSV and shows summary 824ms
@neardrop/web:test:  ✓ src/app/customer/(protected)/parcels/CustomerParcelsClient.integration.test.tsx (1 test) 927ms
@neardrop/web:test:    ✓ CustomerParcelsClient (integration) > filters list when status changes 924ms
@neardrop/web:test:  ✓ src/lib/carrier-transitions.test.ts (6 tests) 4ms
@neardrop/web:test:  ✓ src/app/customer/register/CustomerRegisterForm.test.tsx (1 test) 784ms
@neardrop/web:test:    ✓ CustomerRegisterForm > submits customer registration with postcode 782ms
@neardrop/web:test:  ✓ src/components/carrier/CarrierNav.test.tsx (2 tests) 321ms
@neardrop/web:test:  ✓ src/lib/hooks/useParcel.test.tsx (1 test) 43ms
@neardrop/web:test:  ✓ src/lib/hooks/useCollectionQr.test.tsx (2 tests) 39ms
@neardrop/web:test:  ✓ src/components/customer/CustomerNav.test.tsx (1 test) 348ms
@neardrop/web:test:    ✓ CustomerNav > shows user name and signs out to customer login 347ms
@neardrop/web:test:  ✓ src/app/carrier/manifests/CarrierManifestsClient.integration.test.tsx (2 tests) 242ms
@neardrop/web:test:  ✓ src/lib/hooks/useAffiliateSummary.test.tsx (1 test) 72ms
@neardrop/web:test:  ✓ src/lib/hooks/useAffiliateMatch.test.tsx (1 test) 39ms
@neardrop/web:test:  ✓ src/lib/hooks/useCustomerParcels.test.tsx (1 test) 23ms
@neardrop/web:test:  ✓ src/components/carrier/StatusBadge.test.tsx (7 tests) 63ms
@neardrop/web:test:  ✓ src/lib/server/carrier-route-gate.test.ts (4 tests) 6ms
@neardrop/web:test:  ✓ src/app/customer/(protected)/dashboard/CustomerDashboardClient.integration.test.tsx (1 test) 360ms
@neardrop/web:test:    ✓ CustomerDashboardClient (integration) > shows matched affiliate map section 359ms
@neardrop/web:test:  ✓ src/components/customer/AffiliateMap.test.tsx (1 test) 232ms
@neardrop/web:test:  ✓ src/components/customer/QRDisplay.test.tsx (1 test) 87ms
@neardrop/api:test: {"level":30,"time":1775322733610,"pid":82085,"hostname":"MacBookAir.lan","reqId":"7d845452-58b9-445d-9a19-a948ff8c64da","req":{"method":"POST","url":"/api/v1/auth/login","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test: {"level":30,"time":1775322733611,"pid":82085,"hostname":"MacBookAir.lan","reqId":"7d845452-58b9-445d-9a19-a948ff8c64da","res":{"statusCode":401},"responseTime":0.5484998226165771,"msg":"request completed"}
@neardrop/api:test: {"level":30,"time":1775322733611,"pid":82085,"hostname":"MacBookAir.lan","reqId":"14d599ba-65aa-49c1-a088-ee5b44859932","req":{"method":"POST","url":"/api/v1/auth/login","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/web:test:  ✓ src/components/customer/CustomerParcelCard.test.tsx (1 test) 167ms
@neardrop/api:test: {"level":30,"time":1775322733612,"pid":82085,"hostname":"MacBookAir.lan","reqId":"14d599ba-65aa-49c1-a088-ee5b44859932","res":{"statusCode":401},"responseTime":0.7465000152587891,"msg":"request completed"}
@neardrop/web:test:  ✓ src/lib/server/customer-route-gate.test.ts (4 tests) 7ms
@neardrop/web:test:  ✓ src/lib/utils.test.ts (1 test) 1ms
@neardrop/web:test: 
@neardrop/web:test:  Test Files  30 passed (30)
@neardrop/web:test:       Tests  84 passed (84)
@neardrop/web:test:    Start at  22:32:49
@neardrop/web:test:    Duration  18.92s (transform 4.93s, setup 17.18s, collect 10.38s, tests 13.24s, environment 67.47s, prepare 5.90s)
@neardrop/web:test: 
@neardrop/api:test: {"level":30,"time":1775322733612,"pid":82085,"hostname":"MacBookAir.lan","reqId":"3b2a0919-b842-4d29-8284-0820dcffb9b4","req":{"method":"POST","url":"/api/v1/auth/login","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test: {"level":30,"time":1775322733613,"pid":82085,"hostname":"MacBookAir.lan","reqId":"3b2a0919-b842-4d29-8284-0820dcffb9b4","res":{"statusCode":401},"responseTime":0.753209114074707,"msg":"request completed"}
@neardrop/api:test: {"level":30,"time":1775322733613,"pid":82085,"hostname":"MacBookAir.lan","reqId":"e79ca86e-e4dd-4232-9cde-4cfbf546970d","req":{"method":"POST","url":"/api/v1/auth/login","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test: {"level":30,"time":1775322733613,"pid":82085,"hostname":"MacBookAir.lan","reqId":"e79ca86e-e4dd-4232-9cde-4cfbf546970d","res":{"statusCode":429},"responseTime":0.3333749771118164,"msg":"request completed"}
@neardrop/api:test:  ✓ src/routes/auth.login.rate-limit.test.ts (1 test) 46ms
@neardrop/api:test: {"level":30,"time":1775322733623,"pid":82086,"hostname":"MacBookAir.lan","reqId":"cb2a0c63-8c5b-4ec7-919c-3fb19187a6ac","req":{"method":"GET","url":"/__test_validation","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
@neardrop/api:test:  ✓ src/plugins/error-handler.test.ts (1 test) 35ms
@neardrop/api:test: {"level":30,"time":1775322733627,"pid":82086,"hostname":"MacBookAir.lan","reqId":"cb2a0c63-8c5b-4ec7-919c-3fb19187a6ac","res":{"statusCode":400},"responseTime":4.2630839347839355,"msg":"request completed"}
@neardrop/api:test: 
@neardrop/api:test:  Test Files  15 passed | 7 skipped (22)
@neardrop/api:test:       Tests  62 passed | 12 skipped (74)
@neardrop/api:test:    Start at  22:42:10
@neardrop/api:test:    Duration  3.38s (transform 1.08s, setup 0ms, collect 11.39s, tests 806ms, environment 9ms, prepare 3.16s)
@neardrop/api:test: 

 Tasks:    4 successful, 4 total
Cached:    4 cached, 4 total
  Time:    355ms >>> FULL TURBO

```

---

## GATE: migrate
status: PASS

Command: `npm run migrate`

```

> migrate
> npm run migrate --workspace=@neardrop/api


> @neardrop/api@0.0.0 migrate
> knex migrate:latest --knexfile knexfile.cjs

Already up to date
```

---

## GATE: migrate:rollback
status: PASS

Command: `npm run migrate:rollback`

```

> migrate:rollback
> npm run migrate:rollback --workspace=@neardrop/api


> @neardrop/api@0.0.0 migrate:rollback
> knex migrate:rollback --knexfile knexfile.cjs

Batch 3 rolled back: 1 migrations
```

---

## GATE: migrate (repeat)
status: PASS

Command: `npm run migrate`

```

> migrate
> npm run migrate --workspace=@neardrop/api


> @neardrop/api@0.0.0 migrate
> knex migrate:latest --knexfile knexfile.cjs

Batch 3 run: 1 migrations
```

---

## GATE: test:integration
status: PASS

Command: `env RUN_DB_INTEGRATION=1 npm run test:integration`

```

> test:integration
> RUN_DB_INTEGRATION=1 npm run test:integration --workspace=@neardrop/api


> @neardrop/api@0.0.0 test:integration
> vitest run --no-file-parallelism --testTimeout 120000 src/database/schema.integration.test.ts src/repositories/user.repository.integration.test.ts src/routes/auth.flow.integration.test.ts src/routes/health.db.integration.test.ts src/routes/parcel.phase2.integration.test.ts src/routes/parcel.phase3.integration.test.ts src/routes/affiliates.integration.test.ts


 RUN  v2.1.9 /Users/niteshrav/Documents/ContextFirstAI_Projects/NearDrop/project_scaffolding/apps/api

{"level":30,"time":1775322802811,"pid":84519,"hostname":"MacBookAir.lan","reqId":"451e5c5f-a1d0-4c49-8b04-0c0e3f40dff1","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322803278,"pid":84519,"hostname":"MacBookAir.lan","reqId":"451e5c5f-a1d0-4c49-8b04-0c0e3f40dff1","res":{"statusCode":200},"responseTime":466.6791250705719,"msg":"request completed"}
{"level":30,"time":1775322803279,"pid":84519,"hostname":"MacBookAir.lan","reqId":"fbc82b68-9f37-4ee3-ae64-d5a07cc10f94","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322803680,"pid":84519,"hostname":"MacBookAir.lan","reqId":"fbc82b68-9f37-4ee3-ae64-d5a07cc10f94","res":{"statusCode":200},"responseTime":401.07016587257385,"msg":"request completed"}
{"level":30,"time":1775322803680,"pid":84519,"hostname":"MacBookAir.lan","reqId":"0d2268c0-2be2-429a-956a-29e756f5261d","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322804067,"pid":84519,"hostname":"MacBookAir.lan","reqId":"0d2268c0-2be2-429a-956a-29e756f5261d","res":{"statusCode":200},"responseTime":386.79499983787537,"msg":"request completed"}
{"level":30,"time":1775322804067,"pid":84519,"hostname":"MacBookAir.lan","reqId":"33bdca7e-c0f6-488f-9fcb-28042483586f","req":{"method":"POST","url":"/api/v1/parcels/manifest","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322804125,"pid":84519,"hostname":"MacBookAir.lan","reqId":"33bdca7e-c0f6-488f-9fcb-28042483586f","res":{"statusCode":200},"responseTime":57.88374996185303,"msg":"request completed"}
{"level":30,"time":1775322804126,"pid":84519,"hostname":"MacBookAir.lan","reqId":"a31755e6-41f3-46f0-bfdf-e00aa8442028","req":{"method":"GET","url":"/api/v1/parcels","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322804128,"pid":84519,"hostname":"MacBookAir.lan","reqId":"a31755e6-41f3-46f0-bfdf-e00aa8442028","res":{"statusCode":200},"responseTime":2.4329159259796143,"msg":"request completed"}
{"level":30,"time":1775322804128,"pid":84519,"hostname":"MacBookAir.lan","reqId":"f561db2c-175e-43ba-8e6e-4fc8d69c9549","req":{"method":"GET","url":"/api/v1/parcels","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322804130,"pid":84519,"hostname":"MacBookAir.lan","reqId":"f561db2c-175e-43ba-8e6e-4fc8d69c9549","res":{"statusCode":200},"responseTime":1.6737918853759766,"msg":"request completed"}
{"level":30,"time":1775322804130,"pid":84519,"hostname":"MacBookAir.lan","reqId":"b082a559-4846-4bc5-ac57-5de7d2c21adc","req":{"method":"GET","url":"/api/v1/parcels/34020fde-e1f6-4382-bae9-355c5b051209","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322804131,"pid":84519,"hostname":"MacBookAir.lan","reqId":"b082a559-4846-4bc5-ac57-5de7d2c21adc","res":{"statusCode":200},"responseTime":0.8476250171661377,"msg":"request completed"}
{"level":30,"time":1775322804131,"pid":84519,"hostname":"MacBookAir.lan","reqId":"ba3542cd-534f-4bdc-a972-bfc8340ef3e3","req":{"method":"PATCH","url":"/api/v1/parcels/34020fde-e1f6-4382-bae9-355c5b051209/status","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322804136,"pid":84519,"hostname":"MacBookAir.lan","reqId":"ba3542cd-534f-4bdc-a972-bfc8340ef3e3","res":{"statusCode":200},"responseTime":4.912917137145996,"msg":"request completed"}
{"level":30,"time":1775322804137,"pid":84519,"hostname":"MacBookAir.lan","reqId":"3cb94240-4b98-4b21-90b4-3a8dd54120a1","req":{"method":"PATCH","url":"/api/v1/parcels/34020fde-e1f6-4382-bae9-355c5b051209/status","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322804170,"pid":84519,"hostname":"MacBookAir.lan","reqId":"3cb94240-4b98-4b21-90b4-3a8dd54120a1","res":{"statusCode":200},"responseTime":33.0086669921875,"msg":"request completed"}
{"level":30,"time":1775322804170,"pid":84519,"hostname":"MacBookAir.lan","reqId":"2ab56f57-c400-4661-b822-944f3572be93","req":{"method":"PATCH","url":"/api/v1/parcels/34020fde-e1f6-4382-bae9-355c5b051209/status","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322804175,"pid":84519,"hostname":"MacBookAir.lan","reqId":"2ab56f57-c400-4661-b822-944f3572be93","res":{"statusCode":200},"responseTime":4.3263750076293945,"msg":"request completed"}
{"level":30,"time":1775322804175,"pid":84519,"hostname":"MacBookAir.lan","reqId":"96b16175-8b96-4bb1-a8c2-8a6bf3d7da99","req":{"method":"GET","url":"/api/v1/parcels/34020fde-e1f6-4382-bae9-355c5b051209/collection-qr","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322804181,"pid":84519,"hostname":"MacBookAir.lan","to":"p2-cust-1775322802803@example.com","subject":"Your parcel is ready to collect","bodyPreview":"Your parcel is ready to collect from your NearDrop affiliate (ref M-1775322802803).","msg":"email_outbound"}
{"level":30,"time":1775322804183,"pid":84519,"hostname":"MacBookAir.lan","reqId":"96b16175-8b96-4bb1-a8c2-8a6bf3d7da99","res":{"statusCode":200},"responseTime":7.336667060852051,"msg":"request completed"}
{"level":30,"time":1775322804183,"pid":84519,"hostname":"MacBookAir.lan","reqId":"6c8efa47-285a-4d2c-86f1-45e55aa86cc6","req":{"method":"POST","url":"/api/v1/parcels/34020fde-e1f6-4382-bae9-355c5b051209/collect","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322804241,"pid":84519,"hostname":"MacBookAir.lan","to":"p2-cust-1775322802803@example.com","subject":"Your parcel has been collected","bodyPreview":"Your parcel has been collected (ref M-1775322802803).","msg":"email_outbound"}
{"level":30,"time":1775322804242,"pid":84519,"hostname":"MacBookAir.lan","reqId":"6c8efa47-285a-4d2c-86f1-45e55aa86cc6","res":{"statusCode":200},"responseTime":59.00495791435242,"msg":"request completed"}
{"level":30,"time":1775322804244,"pid":84519,"hostname":"MacBookAir.lan","reqId":"cfb3a064-459e-4597-9ca1-678e9448998e","req":{"method":"PATCH","url":"/api/v1/parcels/34020fde-e1f6-4382-bae9-355c5b051209/status","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322804245,"pid":84519,"hostname":"MacBookAir.lan","reqId":"cfb3a064-459e-4597-9ca1-678e9448998e","res":{"statusCode":422},"responseTime":1.401082992553711,"msg":"request completed"}
 ✓ src/routes/parcel.phase2.integration.test.ts (1 test) 1494ms
   ✓ Phase 2 parcel flow (PostgreSQL) > manifest, postcode match, role-scoped list, state transitions, history 1493ms
{"level":30,"time":1775322804721,"pid":84565,"hostname":"MacBookAir.lan","reqId":"53befeca-ef6c-4b82-8854-189cea5c7d1a","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322805076,"pid":84565,"hostname":"MacBookAir.lan","reqId":"53befeca-ef6c-4b82-8854-189cea5c7d1a","res":{"statusCode":200},"responseTime":354.5457499027252,"msg":"request completed"}
{"level":30,"time":1775322805077,"pid":84565,"hostname":"MacBookAir.lan","reqId":"8221f287-e50c-41bf-899a-01cfc9fba9e4","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322805375,"pid":84565,"hostname":"MacBookAir.lan","reqId":"8221f287-e50c-41bf-899a-01cfc9fba9e4","res":{"statusCode":200},"responseTime":298.3067500591278,"msg":"request completed"}
{"level":30,"time":1775322805376,"pid":84565,"hostname":"MacBookAir.lan","reqId":"36c280e5-7c30-4fa5-87df-ab9059dbfe15","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322805661,"pid":84565,"hostname":"MacBookAir.lan","reqId":"36c280e5-7c30-4fa5-87df-ab9059dbfe15","res":{"statusCode":200},"responseTime":285.8139581680298,"msg":"request completed"}
{"level":30,"time":1775322805662,"pid":84565,"hostname":"MacBookAir.lan","reqId":"61da55d8-c3c7-40cd-95c7-bbc1ab5aa1cc","req":{"method":"POST","url":"/api/v1/parcels/manifest","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322805673,"pid":84565,"hostname":"MacBookAir.lan","reqId":"61da55d8-c3c7-40cd-95c7-bbc1ab5aa1cc","res":{"statusCode":200},"responseTime":11.064040899276733,"msg":"request completed"}
{"level":30,"time":1775322805673,"pid":84565,"hostname":"MacBookAir.lan","reqId":"a49d0b04-4b32-44de-b222-f3be64c6443b","req":{"method":"PATCH","url":"/api/v1/parcels/5a2b017e-f0da-4bef-a044-ad13b7137e97/status","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322805686,"pid":84565,"hostname":"MacBookAir.lan","reqId":"a49d0b04-4b32-44de-b222-f3be64c6443b","res":{"statusCode":200},"responseTime":12.42466688156128,"msg":"request completed"}
{"level":30,"time":1775322805686,"pid":84565,"hostname":"MacBookAir.lan","reqId":"b7c77905-2672-42ca-b57a-d53cb35cbac3","req":{"method":"PATCH","url":"/api/v1/parcels/5a2b017e-f0da-4bef-a044-ad13b7137e97/status","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322805691,"pid":84565,"hostname":"MacBookAir.lan","reqId":"b7c77905-2672-42ca-b57a-d53cb35cbac3","res":{"statusCode":200},"responseTime":5.346041917800903,"msg":"request completed"}
{"level":30,"time":1775322805692,"pid":84565,"hostname":"MacBookAir.lan","reqId":"95bbe00d-ef21-4304-92fa-551a43e1e622","req":{"method":"PATCH","url":"/api/v1/parcels/5a2b017e-f0da-4bef-a044-ad13b7137e97/status","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322805695,"pid":84565,"hostname":"MacBookAir.lan","reqId":"95bbe00d-ef21-4304-92fa-551a43e1e622","res":{"statusCode":200},"responseTime":3.3950419425964355,"msg":"request completed"}
{"level":30,"time":1775322805696,"pid":84565,"hostname":"MacBookAir.lan","reqId":"36b39968-53bb-4848-803f-ea5f2abaf318","req":{"method":"GET","url":"/api/v1/parcels/5a2b017e-f0da-4bef-a044-ad13b7137e97/collection-qr","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322805699,"pid":84565,"hostname":"MacBookAir.lan","to":"p3-cust-1775322804716@example.com","subject":"Your parcel is ready to collect","bodyPreview":"Your parcel is ready to collect from your NearDrop affiliate (ref M3-1775322804716).","msg":"email_outbound"}
{"level":30,"time":1775322805700,"pid":84565,"hostname":"MacBookAir.lan","reqId":"36b39968-53bb-4848-803f-ea5f2abaf318","res":{"statusCode":200},"responseTime":4.417708873748779,"msg":"request completed"}
{"level":30,"time":1775322805701,"pid":84565,"hostname":"MacBookAir.lan","reqId":"5db573a5-4962-4e44-b7d8-59f71cad4f38","req":{"method":"POST","url":"/api/v1/parcels/5a2b017e-f0da-4bef-a044-ad13b7137e97/collect","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322805710,"pid":84565,"hostname":"MacBookAir.lan","to":"p3-cust-1775322804716@example.com","subject":"Your parcel has been collected","bodyPreview":"Your parcel has been collected (ref M3-1775322804716).","msg":"email_outbound"}
{"level":30,"time":1775322805711,"pid":84565,"hostname":"MacBookAir.lan","reqId":"5db573a5-4962-4e44-b7d8-59f71cad4f38","res":{"statusCode":200},"responseTime":10.360291004180908,"msg":"request completed"}
{"level":30,"time":1775322805713,"pid":84565,"hostname":"MacBookAir.lan","reqId":"2313cd60-ba9b-4e41-b386-82079aeac9bf","req":{"method":"POST","url":"/api/v1/parcels/5a2b017e-f0da-4bef-a044-ad13b7137e97/collect","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322805716,"pid":84565,"hostname":"MacBookAir.lan","reqId":"2313cd60-ba9b-4e41-b386-82079aeac9bf","res":{"statusCode":409},"responseTime":2.219666004180908,"msg":"request completed"}
 ✓ src/routes/parcel.phase3.integration.test.ts (1 test) 1055ms
   ✓ Phase 3 QR collection (PostgreSQL) > customer issues collection JWT; affiliate completes via Bearer + body (mobile-style) 1054ms
{"level":30,"time":1775322806041,"pid":84611,"hostname":"MacBookAir.lan","reqId":"8fa926e1-78e2-4d72-90a8-cf153d86171d","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322806370,"pid":84611,"hostname":"MacBookAir.lan","reqId":"8fa926e1-78e2-4d72-90a8-cf153d86171d","res":{"statusCode":200},"responseTime":327.9758331775665,"msg":"request completed"}
{"level":30,"time":1775322806370,"pid":84611,"hostname":"MacBookAir.lan","reqId":"d06ca9af-ce09-4f0f-a7f9-36a2a8c01e17","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322806656,"pid":84611,"hostname":"MacBookAir.lan","reqId":"d06ca9af-ce09-4f0f-a7f9-36a2a8c01e17","res":{"statusCode":200},"responseTime":285.3370418548584,"msg":"request completed"}
{"level":30,"time":1775322806656,"pid":84611,"hostname":"MacBookAir.lan","reqId":"d0342d86-56ab-4ba6-be47-309dadf5740a","req":{"method":"GET","url":"/api/v1/affiliates/match","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322806661,"pid":84611,"hostname":"MacBookAir.lan","reqId":"d0342d86-56ab-4ba6-be47-309dadf5740a","res":{"statusCode":200},"responseTime":5.060166835784912,"msg":"request completed"}
{"level":30,"time":1775322806675,"pid":84611,"hostname":"MacBookAir.lan","reqId":"ef15a779-5456-44d1-9759-2741dd9c9106","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322806975,"pid":84611,"hostname":"MacBookAir.lan","reqId":"ef15a779-5456-44d1-9759-2741dd9c9106","res":{"statusCode":200},"responseTime":299.61383414268494,"msg":"request completed"}
{"level":30,"time":1775322806975,"pid":84611,"hostname":"MacBookAir.lan","reqId":"7145270a-3a93-4875-ba84-958cc0142d4f","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322807285,"pid":84611,"hostname":"MacBookAir.lan","reqId":"7145270a-3a93-4875-ba84-958cc0142d4f","res":{"statusCode":200},"responseTime":309.6869580745697,"msg":"request completed"}
{"level":30,"time":1775322807285,"pid":84611,"hostname":"MacBookAir.lan","reqId":"7eb9d63c-4a2a-436f-bd1b-71ab5eb29b5f","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322807627,"pid":84611,"hostname":"MacBookAir.lan","reqId":"7eb9d63c-4a2a-436f-bd1b-71ab5eb29b5f","res":{"statusCode":200},"responseTime":342.0752499103546,"msg":"request completed"}
{"level":30,"time":1775322807628,"pid":84611,"hostname":"MacBookAir.lan","reqId":"b5b1fc46-a65c-4cf2-8d80-5001cf195fe0","req":{"method":"POST","url":"/api/v1/parcels/manifest","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322807638,"pid":84611,"hostname":"MacBookAir.lan","reqId":"b5b1fc46-a65c-4cf2-8d80-5001cf195fe0","res":{"statusCode":200},"responseTime":10.666041851043701,"msg":"request completed"}
{"level":30,"time":1775322807639,"pid":84611,"hostname":"MacBookAir.lan","reqId":"0d39bdfe-d95f-426d-b15c-8589fad11aae","req":{"method":"GET","url":"/api/v1/parcels?page=1&limit=10","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322807641,"pid":84611,"hostname":"MacBookAir.lan","reqId":"0d39bdfe-d95f-426d-b15c-8589fad11aae","res":{"statusCode":200},"responseTime":2.029041051864624,"msg":"request completed"}
{"level":30,"time":1775322807641,"pid":84611,"hostname":"MacBookAir.lan","reqId":"62eb4050-966b-42d1-b1cb-bdb3697a7ebc","req":{"method":"GET","url":"/api/v1/affiliates/f13cd8f2-6367-4e7d-91c4-4ebee3389e04/summary","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322807644,"pid":84611,"hostname":"MacBookAir.lan","reqId":"62eb4050-966b-42d1-b1cb-bdb3697a7ebc","res":{"statusCode":200},"responseTime":2.697458028793335,"msg":"request completed"}
 ✓ src/routes/affiliates.integration.test.ts (2 tests) 1653ms
   ✓ Affiliate read routes (PostgreSQL) > customer GET /affiliates/match returns best affiliate for postcode 666ms
   ✓ Affiliate read routes (PostgreSQL) > customer GET /affiliates/:id/summary succeeds when parcel links affiliate 987ms
{"level":30,"time":1775322808059,"pid":84657,"hostname":"MacBookAir.lan","reqId":"08ee2f51-cd4a-4189-b716-421fa43a6138","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322808384,"pid":84657,"hostname":"MacBookAir.lan","reqId":"08ee2f51-cd4a-4189-b716-421fa43a6138","res":{"statusCode":200},"responseTime":324.8054578304291,"msg":"request completed"}
{"level":30,"time":1775322808385,"pid":84657,"hostname":"MacBookAir.lan","reqId":"58f7873b-1cbb-4a03-bb5e-1bf7855d46a8","req":{"method":"GET","url":"/api/v1/auth/me","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322808387,"pid":84657,"hostname":"MacBookAir.lan","reqId":"58f7873b-1cbb-4a03-bb5e-1bf7855d46a8","res":{"statusCode":200},"responseTime":1.7658751010894775,"msg":"request completed"}
{"level":30,"time":1775322808387,"pid":84657,"hostname":"MacBookAir.lan","reqId":"356b0c0d-3c07-44f4-94fe-567ba1bc7fc8","req":{"method":"GET","url":"/api/v1/auth/ops-ping","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322808388,"pid":84657,"hostname":"MacBookAir.lan","reqId":"356b0c0d-3c07-44f4-94fe-567ba1bc7fc8","res":{"statusCode":403},"responseTime":0.5432918071746826,"msg":"request completed"}
{"level":30,"time":1775322808388,"pid":84657,"hostname":"MacBookAir.lan","reqId":"e3a4b33d-085e-46ec-a188-262b4ee57523","req":{"method":"POST","url":"/api/v1/auth/refresh","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322808391,"pid":84657,"hostname":"MacBookAir.lan","reqId":"e3a4b33d-085e-46ec-a188-262b4ee57523","res":{"statusCode":200},"responseTime":3.279249906539917,"msg":"request completed"}
{"level":30,"time":1775322808391,"pid":84657,"hostname":"MacBookAir.lan","reqId":"1237a8bd-f516-4d11-8869-3bb3fe0c6968","req":{"method":"POST","url":"/api/v1/auth/logout","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322808392,"pid":84657,"hostname":"MacBookAir.lan","reqId":"1237a8bd-f516-4d11-8869-3bb3fe0c6968","res":{"statusCode":200},"responseTime":1.0432498455047607,"msg":"request completed"}
{"level":30,"time":1775322808403,"pid":84657,"hostname":"MacBookAir.lan","reqId":"e4a446fe-2574-441d-ae36-04b9cd7f1d2e","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322808737,"pid":84657,"hostname":"MacBookAir.lan","reqId":"e4a446fe-2574-441d-ae36-04b9cd7f1d2e","res":{"statusCode":200},"responseTime":333.33524990081787,"msg":"request completed"}
{"level":30,"time":1775322808737,"pid":84657,"hostname":"MacBookAir.lan","reqId":"38f4f633-eae2-4dbd-b897-c662d6560f32","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322808738,"pid":84657,"hostname":"MacBookAir.lan","reqId":"38f4f633-eae2-4dbd-b897-c662d6560f32","res":{"statusCode":409},"responseTime":1.2221250534057617,"msg":"request completed"}
{"level":30,"time":1775322808748,"pid":84657,"hostname":"MacBookAir.lan","reqId":"91078b38-8fb3-43e4-ab2a-73e11884777b","req":{"method":"POST","url":"/api/v1/auth/register","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322809045,"pid":84657,"hostname":"MacBookAir.lan","reqId":"91078b38-8fb3-43e4-ab2a-73e11884777b","res":{"statusCode":200},"responseTime":296.7966251373291,"msg":"request completed"}
{"level":30,"time":1775322809046,"pid":84657,"hostname":"MacBookAir.lan","reqId":"e32bbfcf-7e74-462c-a8e3-b0a876145ec3","req":{"method":"GET","url":"/api/v1/auth/ops-ping","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322809046,"pid":84657,"hostname":"MacBookAir.lan","reqId":"e32bbfcf-7e74-462c-a8e3-b0a876145ec3","res":{"statusCode":200},"responseTime":0.5858328342437744,"msg":"request completed"}
 ✓ src/routes/auth.flow.integration.test.ts (3 tests) 1040ms
   ✓ auth flow (PostgreSQL) > register, /me with cookie, refresh, logout 384ms
   ✓ auth flow (PostgreSQL) > rejects duplicate registration 346ms
   ✓ auth flow (PostgreSQL) > ops role receives 200 from /api/v1/auth/ops-ping 310ms
 ✓ src/database/schema.integration.test.ts (3 tests) 43ms
{"level":30,"time":1775322810139,"pid":84710,"hostname":"MacBookAir.lan","reqId":"16fc08b4-1a2f-4301-81c0-10e2662b137b","req":{"method":"GET","url":"/api/v1/health","hostname":"localhost:80","remoteAddress":"127.0.0.1"},"msg":"incoming request"}
{"level":30,"time":1775322810162,"pid":84710,"hostname":"MacBookAir.lan","reqId":"16fc08b4-1a2f-4301-81c0-10e2662b137b","res":{"statusCode":200},"responseTime":21.82879090309143,"msg":"request completed"}
 ✓ src/routes/health.db.integration.test.ts (1 test) 75ms
 ✓ src/repositories/user.repository.integration.test.ts (1 test) 38ms

 Test Files  7 passed (7)
      Tests  12 passed (12)
   Start at  22:43:22
   Duration  8.24s (transform 187ms, setup 0ms, collect 1.83s, tests 5.40s, environment 1ms, prepare 250ms)

```

---

## GATE: build
status: PASS

Command: `npm run build`

```

> build
> turbo run build


   • Packages in scope: @neardrop/api, @neardrop/shared, @neardrop/web
   • Running build in 3 packages
   • Remote caching disabled

@neardrop/shared:build: cache hit, replaying logs 3ca1a5078d13a0fa
@neardrop/shared:build: 
@neardrop/shared:build: > @neardrop/shared@0.0.0 build
@neardrop/shared:build: > tsc -p tsconfig.build.json
@neardrop/shared:build: 
@neardrop/api:build: cache hit, replaying logs ae15b722cc5e6a82
@neardrop/api:build: 
@neardrop/api:build: > @neardrop/api@0.0.0 build
@neardrop/api:build: > tsc -p tsconfig.build.json
@neardrop/api:build: 
@neardrop/web:build: cache hit, replaying logs 30347341dc4b0b22
@neardrop/web:build: 
@neardrop/web:build: > @neardrop/web@0.0.0 build
@neardrop/web:build: > cross-env NODE_ENV=production next build
@neardrop/web:build: 
@neardrop/web:build:   ▲ Next.js 14.2.35
@neardrop/web:build:   - Environments: .env.local
@neardrop/web:build: 
@neardrop/web:build:    Creating an optimized production build ...
@neardrop/web:build:  ✓ Compiled successfully
@neardrop/web:build:    Linting and checking validity of types ...
@neardrop/web:build:    Collecting page data ...
@neardrop/web:build:    Generating static pages (0/20) ...
@neardrop/web:build:    Generating static pages (5/20) 
@neardrop/web:build:    Generating static pages (10/20) 
@neardrop/web:build:    Generating static pages (15/20) 
@neardrop/web:build:  ✓ Generating static pages (20/20)
@neardrop/web:build:    Finalizing page optimization ...
@neardrop/web:build:    Collecting build traces ...
@neardrop/web:build: 
@neardrop/web:build: Route (app)                              Size     First Load JS
@neardrop/web:build: ┌ ○ /                                    168 B          87.4 kB
@neardrop/web:build: ├ ○ /_not-found                          876 B          88.1 kB
@neardrop/web:build: ├ ○ /affiliate/dashboard                 168 B          87.4 kB
@neardrop/web:build: ├ ○ /affiliate/earnings                  169 B          87.4 kB
@neardrop/web:build: ├ ○ /affiliate/parcels                   170 B          87.4 kB
@neardrop/web:build: ├ ○ /affiliate/scan                      168 B          87.4 kB
@neardrop/web:build: ├ ƒ /carrier/dashboard                   2.57 kB        98.5 kB
@neardrop/web:build: ├ ƒ /carrier/manifests                   1.95 kB        97.9 kB
@neardrop/web:build: ├ ƒ /carrier/parcels                     2.67 kB        89.9 kB
@neardrop/web:build: ├ ƒ /customer/dashboard                  1.8 kB         97.7 kB
@neardrop/web:build: ├ ƒ /customer/parcels                    2.46 kB        98.4 kB
@neardrop/web:build: ├ ƒ /customer/parcels/[id]               8.45 kB         104 kB
@neardrop/web:build: ├ ○ /customer/register                   1.84 kB        97.8 kB
@neardrop/web:build: ├ ○ /login                               1.74 kB        97.7 kB
@neardrop/web:build: ├ ○ /ops/affiliates                      168 B          87.4 kB
@neardrop/web:build: ├ ○ /ops/dashboard                       168 B          87.4 kB
@neardrop/web:build: ├ ○ /ops/parcels                         168 B          87.4 kB
@neardrop/web:build: ├ ○ /ops/stats                           171 B          87.4 kB
@neardrop/web:build: └ ○ /register                            1.73 kB        97.7 kB
@neardrop/web:build: + First Load JS shared by all            87.3 kB
@neardrop/web:build:   ├ chunks/1dd3208c-20d72fa473ea7953.js  53.7 kB
@neardrop/web:build:   ├ chunks/528-a4d90ce7be035259.js       31.7 kB
@neardrop/web:build:   └ other shared chunks (total)          1.88 kB
@neardrop/web:build: 
@neardrop/web:build: 
@neardrop/web:build: ○  (Static)   prerendered as static content
@neardrop/web:build: ƒ  (Dynamic)  server-rendered on demand
@neardrop/web:build: 

 Tasks:    3 successful, 3 total
Cached:    3 cached, 3 total
  Time:    287ms >>> FULL TURBO

```

---

## Health check (DB connected)

Satisfied by **GATE: test:integration** — `apps/api/src/routes/health.db.integration.test.ts` issues `GET /api/v1/health` with live Knex and expects `200` with `data.database: "connected"`.

---

**Overall Phase 0 exit gate:** PASS
