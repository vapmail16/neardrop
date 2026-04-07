# NearDrop documentation

| Document | Purpose |
| -------- | ------- |
| [MANUAL_TEST_PHASE_0.md](./MANUAL_TEST_PHASE_0.md) | Hands-on checklist before Phase 1 (lint, tests, migrate, health, optional web/E2E) |
| [MANUAL_TEST_PHASE_1.md](./MANUAL_TEST_PHASE_1.md) | Phase 1 auth: automated gates + manual curl smoke (incl. **ops-ping** RBAC) |
| [MANUAL_TEST_PHASE_2.md](./MANUAL_TEST_PHASE_2.md) | Phase 2 parcels: gates + manifest / state machine smoke (`backend/scripts/manual-test-phase2-smoke.sh`) |
| [MANUAL_TEST_PHASE_3.md](./MANUAL_TEST_PHASE_3.md) | Phase 3 QR + collect + notifications: gates + scripted negative/positive API cases (`backend/scripts/manual-test-phase3-smoke.sh`) |
| [NEARDROP_MVP_IMPLEMENTATION_PLAN.md](./NEARDROP_MVP_IMPLEMENTATION_PLAN.md) | Stage-gated MVP plan, exit gates, policy decisions (§14) |
| [API_REFERENCE.md](./API_REFERENCE.md) | HTTP API notes |
| [ISSUE_LOG.md](./ISSUE_LOG.md) | Running issue / decision log |
| [DEPLOYMENT_ISSUE_LOG.md](./DEPLOYMENT_ISSUE_LOG.md) | Deploy / DCDeploy / Docker issues and fixes |
| [BACKEND_DEPLOYMENT_GUIDE.md](./BACKEND_DEPLOYMENT_GUIDE.md) | Backend on DCDeploy (**build runs on platform**, not locally) |
| [FRONTEND_DEPLOYMENT_GUIDE.md](./FRONTEND_DEPLOYMENT_GUIDE.md) | Next.js frontend on DCDeploy (repo-root context, `API_UPSTREAM` build arg) |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Short pre/post deploy checklist |
| [evidence/phase-0-exit-gates.md](./evidence/phase-0-exit-gates.md) | Phase 0 exit gate command output (refresh: `npm run record:phase0-evidence` from `backend/`) |

**Reference material (non-normative for code structure):** see [`example_documents/README.md`](./example_documents/README.md) for consolidated guidelines (`MASTER_GUIDELINES.md`, checklists, audit prompts).

The canonical **layout** is described in the MVP plan and root `README.md` (`frontend/`, `backend/` including `backend/packages/shared`, `backend/database/`).
