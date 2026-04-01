# Historicals Critical E2E Audit and Phased Implementation Plan

**Date:** 2026-03-29  
**Feature:** Historicals ingestion + Data Inputs/Data Input Actuals split + charts + integrations updates  
**Audit Framework:** `CRITICAL_E2E_AUDIT_PROMPT.md`  
**Status:** Assessment only (no implementation in this document)

**Specifications explicitly considered in this revision:**
- `project_documentation/wip/historicals/Historical_Integration_Spec_v4_FINAL.docx`
- `project_documentation/wip/historicals/FPA_Active_Forecast_Spec_v1.docx`

**Feature-specific override (user-approved):**
- For this historicals feature workflow, do **not** append entries to:
  - `project_documentation/docs/ISSUES_LOG.md`
  - `project_documentation/tests/REMAINING_TEST_WORK.md`

---

## 1) Requirement Scope (as provided)

Source file: `project_documentation/wip/historicals/requirements`

Requested outcomes:
- Latest year from QBO/Excel should go to `Data Inputs`.
- Prior years (`year-1 ... year-n`) should go to `Data Input Actuals`.
- Historical P&L should be in "simple mode".
- Build DIA charts.
- Build DIA + Historicals + Forecast charts with visual demarcation.
- Remove `Banking Partners` from left menu.
- Route uploads by time dimension (monthly/quarterly/annual) into DIA.
- QBO integration currently points to Data Inputs; needs split routing by year.
- Add Excel upload path in Integrations for actuals/historicals (P&L + Balance Sheet tabs).
- Handle sign conventions consistently for QBO + Excel uploads.
- Support up to 7 years of historical data.

Specification alignment now required:
- Historical Integration module governs **pre-Year 0** historical ingestion and Year 0 bridge rules.
- FP&A Active Forecast module governs **Year 1 onward** monthly actuals vs budget/reforecast logic.
- Historical and FP&A share field/KPI definitions but remain separate data partitions and workflows.

---

## 2) Executive Findings (Severity Ordered)

### Critical
1. **Current QBO mapped-save path writes to Data Inputs tables only**  
   Backend `quickbooksController.saveMappedData` writes to `profit_loss_data` and `balance_sheet_data` (project-level single-row model), not to periodized DIA storage (`covenant_actuals`).

2. **Data Inputs schema is not periodized; DIA schema is periodized**  
   `profit_loss_data`, `balance_sheet_data`, and other Data Inputs tables are one-row-per-project (unique `project_id`).  
   `covenant_actuals` is periodized (`project_id + year + month + period_type` unique).

3. **Year-split routing requirement cannot be safely added without a canonical "latest year" policy**  
   No existing contract defines latest year using: calendar year, most recent available period, project projection anchor, or user-specified cutoff.

4. **Historical spec and FP&A spec define different temporal boundaries; implementation must enforce hard boundary**  
   Historical Integration spec: historical periods up to Year -1 plus Year 0 bridge (including partial-year annualization rule).  
   FP&A spec: Year 1 onward monthly active forecast and variance workflows.  
   Mixing these in one ingestion path without boundary policy will create double-counting and incorrect chart semantics.

### High
4. **Permission models differ across integration endpoints**  
   Some QBO controller actions use owner checks (`projects.user_id = req.user.id`) while route middleware uses `projectAccess()`. This can break collaboration/team access expectations if reused for historical uploads.

5. **Charts currently consume NCE/projection endpoints, not DIA historical overlays**  
   Existing Executive/Detailed chart flows fetch from `/new-calculation-engine/*` and KPI tables; no built-in blended DIA+forecast timeline pipeline is in place.

6. **Quarterly/annual encoding in DIA uses shared month slot semantics**  
   DIA upload/service behavior uses `month` as quarter index for quarterly and `month=1` sentinel for annual. New ingestion must preserve this contract.

7. **Specs require multi-account mapping and source-tag governance that current split proposal does not yet model end-to-end**  
   Historical spec requires many-to-one mapping persistence, duplicate-account prevention, and source tags (`connector`, `excel`, `manual override`, `annualized`) with overwrite controls.

### Medium
8. **Sign convention policy is not centralized**  
   Existing codebase has multiple places where signs are interpreted/formatted; no single documented rule for QBO + Excel actuals ingestion parity.

9. **Navigation removal requires both menu and route decision**  
   `Banking Partners` appears in sidebar and has a route; "remove tab" needs policy whether to hide nav only or fully deprecate route.

---

## 3) Live Database Validation (Verified)

Validated against live schema/rows from both:
- `api-server/.env.test` (test DB)
- `api-server/.env` (primary/remote-style env vars)

### Periodized actuals side
- `covenant_actuals` exists with key columns: `project_id`, `year`, `month`, `period_type`, financial fields.
- Unique constraint present: `covenant_actuals_project_id_year_month_period_type_key`.
- Test DB rows observed: `48` (`monthly:48`).
- Primary DB rows observed: `152` (`annual:11`, `quarterly:17`, `monthly:124`).
- KPI table volumes:
  - Test DB: `monthly_actuals_kpis=0`, `quarterly_actuals_kpis=0`, `annual_actuals_kpis=0`
  - Primary DB: `monthly_actuals_kpis=381`, `quarterly_actuals_kpis=40`, `annual_actuals_kpis=50`

### Data Inputs side (single-row project model)
- `company_details`, `profit_loss_data`, `balance_sheet_data`, `debt_structure_data`, `growth_assumptions_data`, `working_capital_data`, `seasonality_data`, `cash_flow_data`, `wacc_data` all exist.
- Each has unique `project_id` index/constraint (`*_project_id_unique` or equivalent), confirming one-row-per-project model.
- No native monthly/quarterly/annual period columns in Data Inputs core tables.

### QBO staging/orchestration side
- QBO tables exist (`qbo_connections`, `qbo_*_reports`, `qbo_*_rows`, `qbo_sync_runs`, `qbo_sync_steps`, etc.).
- QBO staging row counts are currently low/empty in sampled DB (`qbo_pnl_rows`, `qbo_balance_sheet_rows`, `qbo_sync_runs` observed at `0` in this environment), but structure is present.

---

## 4) Backend Code-Path Validation

### Existing ingestion paths
- **Data Inputs upload:** `/api/projects/:projectId/csv-upload` via `csvController`/`csvUploadService`, targets Data Inputs sections.
- **DIA upload:** `/api/actuals/:projectId/upload` via `actualsController.uploadActuals`, supports multi-period row-wise/column-wise parsing and writes periodized actuals through `covenantService.saveActuals`.
- **QBO integration:** `/api/quickbooks/:projectId/*` with sync + line-item mapping + `save-mapped-data`.

### Key current behavior
- `quickbooksController.saveMappedData` saves mapped aggregates to `profit_loss_data` + `balance_sheet_data` (Data Inputs), not DIA.
- DIA upload already supports periodized monthly/quarterly/annual payloads and can process multiple periods per file.

### Permissions/feature controls
- DIA routes require feature `covenant_testing`.
- Data Inputs upload requires feature `data_entry`.
- New Calculation Engine chart routes mainly require `detailed_analytics` and KPI routes require `kpi_dashboard`.
- QBO routes use `projectAccess()` middleware, but controller internals include owner-only checks in some methods (must be normalized before extension).

---

## 5) Migration/Docs/Tests Reconciliation

- Product behavior currently favors:
  - Data Inputs = project-level baseline assumptions/input model.
  - DIA = periodized actuals model.
- Requirement requests split-by-year ingestion between these two models, which is **not** an incremental toggle; it is a contract-level extension across ingest, persistence, and visualization.
- Existing automated tests already cover many upload and DIA scenarios; they must be expanded with new split-routing and sign-policy regressions before code changes.
- Historical spec v4 adds non-optional contracts that must be represented in code/tests:
  - partial-current-year annualization for Year 0 (P&L + CF annualized, BS point-in-time not annualized),
  - 32 KPI availability matrix (CF-dependent KPI 28-32),
  - historical granularity labels (monthly/quarterly/annual-only with UI state).
- FP&A spec v1 confirms this historical initiative must remain separate from Year 1+ Active Forecast module; only shared contracts are fields, KPI formulas, and reporting currency.

---

## 6) Object Classification (Per Audit Template)

### MUST COPY
- Historical period values from QBO/Excel into `covenant_actuals` for prior years.
- Period granularity (monthly/quarterly/annual) and period keys (`year`, `month/quarter`, `period_type`).
- Required source metadata needed for traceability/audit (import source, timestamps, actor).
- Year 0 bridge metadata when source period is annualized partial year (months elapsed and annualization label).

### REGENERATE
- Actuals KPI artifacts (`monthly_actuals_kpis`, `quarterly_actuals_kpis`, `annual_actuals_kpis`) from saved DIA actuals.
- Derived chart datasets for DIA/historical overlays (do not persist static merged snapshots unless policy-approved).
- Year 0 bridge comparison outputs (derived view, not hand-entered persisted values unless policy-approved).

### NEVER COPY
- QBO OAuth credentials/tokens (`qbo_tokens`) into DIA/business tables.
- Connection-level secrets/ephemeral sync internals into business-facing historical datasets.

### CONDITIONAL (Policy Decision Required)
- `qbo_mapping_history` persistence depth and retention for historical uploads.
- Whether latest year is always written to Data Inputs on every import or only on explicit user confirmation.
- Whether historical imports may overwrite manually entered DIA values (merge strategy needed).

---

## 7) Hidden Dependency Traps

1. **One-row-per-project constraints** on Data Inputs tables make multi-year storage impossible there by design.
2. **Quarter encoding** for DIA quarterly periods reuses `month` column (1..4 contract).
3. **Annual sentinel month** is currently `1` for DIA annual saves (DB not-null compatibility).
4. **Feature-gated APIs**: split routing can fail silently if user has one feature but not the other.
5. **Controller-level owner checks** in QBO flow can bypass collaboration access assumptions.
6. **Chart consumers currently projection-centric**; blended historical/current/forecast visuals need new data composition layer.
7. **Sign handling variance** can corrupt KPIs/charts if QBO and Excel ingestion apply different normalization rules.
8. **Year 0 annualization edge** (from Historical spec) can be misapplied to Balance Sheet if not explicitly excluded.
9. **FP&A overlap risk**: accidentally storing Year 1+ monthly actuals into historical partition will break Active Forecast budget/actual blending semantics.

---

## 8) Policy Decisions Required (Blockers Before Build)

1. **Latest-year rule:** exact algorithm to classify "latest year" on ingest.
2. **Overwrite policy:** when import collides with existing Data Inputs or DIA periods.
3. **Sign contract:** canonical sign by line item (store normalized vs store source sign + render transform).
4. **Excel integration UX:** one workbook multi-year format vs one file per period; mandatory sheet schema.
5. **Scope of Integrations Excel:** create a new Integration page vs add panel under existing QuickBooks page.
6. **Demarcation standard in charts:** color bands, annotations, or segmented series for historical/current/forecast.
7. **Banking Partners removal:** hide in nav only vs route deprecation/removal.
8. **7-year cap semantics:** strict reject >7 years vs import newest 7 with warning.
9. **Year 0 annualization activation:** when partial-year detected, auto-annualize always vs prompt user override.
10. **Boundary enforcement:** strict rule that Historical module writes pre-Year 0/Year0 only, while FP&A handles Year1+ actuals.
11. **KPI contract precedence:** explicitly adopt historical spec KPI availability matrix (CF-dependent KPIs 28-32 as N/A when CF absent).
12. **New project bootstrap behavior:** decide if new-company/new-project gets seeded historical placeholders or remains empty-until-first-import for historical partitions.

**Implementation should not start until these are approved.**

---

## 9) Phased Implementation Plan (Stage-Gated, TDD-First)

## Phase 0 - Contract Finalization (No code changes)
- Finalize all policy decisions above.
- Produce signed source-to-target mapping matrix for QBO and Excel fields, including multi-account mapping and source-tag metadata.
- Exit gate: approved decision log + mapping spec.

## Phase 1 - Ingestion Contract + Validation Layer
- Add backend contract tests (RED):
  - `ACTUALS_ImportSplit_ByYear_RoutesToCorrectStorage`
  - `ACTUALS_ImportSignRules_NormalizesPerPolicy`
  - `ACTUALS_ImportPeriodType_PersistsMonthlyQuarterlyAnnualCorrectly`
  - `HISTORICAL_Year0_PartialYear_Annualization_AppliesToPnLAndCF_NotBS`
  - `HISTORICAL_KPIAvailability_CFDependentMetrics_ShowNAWithoutCF`
- Implement minimal ingest-routing service (GREEN), refactor for maintainability.
- Exit gate: all new unit/integration tests pass; no regression in existing upload suites.

### Phase 1 Closeout Status (2026-04-01)
- Status: **Completed**
- Manual testing gate: **Passed (user-validated)**
- DB verification gate: **Passed**
  - Verified project: `historicals_testing - Initial Project` (`8f094cb4-4042-4520-abf5-844c32945152`)
  - Verified split persistence:
    - latest year persisted to `profit_loss_data` + `balance_sheet_data`
    - historical years persisted to `covenant_actuals` (`2020`-`2025`, annual)
  - Verified key fields now persisted/visible correctly:
    - `depreciation_and_amortization`, `tax_rates`
    - `one_time_capex_year`, `one_time_equity_year`

### Phase 1 Manual Tester Checklist (Regression + Edge Cases)
- Download Excel template from Integrations Excel and confirm workbook has only `Profit & Loss` and `Balance Sheet` tabs.
- Populate multi-year values in yearly columns (latest year, latest-1, latest-2), upload, and verify mapping screen loads with parsed line items.
- Validate latest-year routing: save mapped data for latest year and verify values appear in Data Inputs (`profit_loss_data`, `balance_sheet_data` views/pages).
- Validate historical routing: save prior years and verify periodized values appear in Data Input Actuals (`covenant_actuals`) by year/period.
- Validate sign normalization: upload mixed signed values and confirm stored/displayed values follow canonical sign contract after save.
- Validate mixed-granularity conflict policy: for same year submit monthly + quarterly + annual overlap and confirm monthly wins over quarterly and annual, quarterly wins over annual.
- Validate 7-year policy: upload more than seven historical years and confirm only policy-allowed range is retained.
- Validate key field persistence/display: `depreciation_and_amortization`, `tax_rates`, `one_time_capex_year`, `one_time_equity_year`, `EBITDA`, `net_profit`, and `total_assets`.

## Phase 2 - QBO Path Refactor for Split Routing
- RED tests for QBO mapped save behavior:
  - latest year -> Data Inputs
  - prior years -> DIA periodized writes
  - permissions parity for collaborators
- GREEN implementation in QBO controller/service path (avoid owner-only mismatch).
- Exit gate: QBO route security tests + split routing tests all pass.

### Phase 2 Closeout Status (2026-04-01)
- Status: **Completed**
- Manual testing gate: **Passed (user-validated)**
- DB verification gate: **Passed**
  - Verified project: `historicals_testing - Initial Project` (`8f094cb4-4042-4520-abf5-844c32945152`)
  - Verified historical monthly persistence:
    - `covenant_actuals` includes `year=2025`, `month=1`, `period_type='monthly'`
    - latest verified values include:
      - `revenue_actual=6012.38`
      - `cogs_actual=1398.66`
      - `operating_expenses_actual=2465.11`
  - Verified anomaly lineage period typing:
    - `actuals_anomaly_data` for `period_end_date=2025-01-31` persisted with `period_type='monthly'`
  - Verified split-routing isolation:
    - latest-year Data Inputs rows (`profit_loss_data`, `balance_sheet_data`) were **not overwritten** by Jan-2025 historical monthly QBO save.
  - Verified N->1 mapping behavior:
    - multiple mapped source rows aggregate into one target field before persistence (QBO + shared pipeline).

### Phase 2 Manual Tester Checklist (Regression + Edge Cases)
- Connect QBO, sync source data, and confirm line items are shown in shared manual mapping UI.
- Map multiple source rows to one MMW target (N->1) and confirm no duplicate mapping warning blocks this flow.
- Save mapped data with latest-year + historical periods and verify split routing remains correct:
  - latest-year writes to Data Inputs tables
  - historical periods write to `covenant_actuals`
- Validate anomaly lineage metadata for monthly saves by checking behavior tied to `period_type='monthly'` scenarios.
- Re-run save for same historical period to confirm overwrite/idempotency behavior follows approved policy without corrupting latest-year Data Inputs rows.
- Validate calculated-field UX contract in mapping table:
  - `EBITDA` is not manually selectable as a mapping target
  - mapped derived outputs still calculate downstream in Data Inputs/DIA views.

## Phase 3 - Integrations Excel Path for Actuals/Historicals
- RED tests for new Excel integration workflow (schema validation, multi-year, 7-year cap, sign rules).
- Add RED tests for historical-spec template expectations (three statements, locked auto rows behavior contract, period-label compatibility checks).
- GREEN implementation using shared ingestion contract service (avoid duplicate parser logic).
- Exit gate: upload success/failure matrix tests pass; duplicate + malformed file regressions pass.

### Phase 3 Manual Tester Checklist (Current Gate)
- Happy path: upload valid workbook (P&L + Balance Sheet), map required lines, and save successfully through shared pipeline.
- Mixed sheet-mode merge: use Data Inputs-style yearly columns in one sheet and row-wise format in the other for the same period; confirm upload succeeds and period merges into one logical bucket.
- Invalid period type rejection: set row-wise `Period Type` to invalid value (for example `weekly`) and confirm upload fails with explicit validation error.
- Missing `Field Name` contract: remove/rename `Field Name` header in Data Inputs-style sheet (while year columns exist) and confirm upload fails with schema error.
- Missing `Year` row contract: remove `Year` row in row-wise sheet and confirm upload fails with schema error.
- No numeric data rejection: keep headers but no numeric line items and confirm upload fails with contract error.
- Mixed-sheet malformed contract: keep one sheet valid row-wise and make other sheet malformed Data Inputs-style; confirm full upload is rejected (no partial accept).
- N->1 aggregation on Excel mapping: map multiple source rows into one target and confirm persisted output is summed correctly.

## Phase 4 - DIA Charts + Combined Historicals/Current/Forecast Charts
- RED tests for chart data composition and demarcation:
  - correct bucket assignment (historical/current/forecast)
  - rendered legend/labels and export parity
- include Year 0 bridge marker and annualized-label behavior where applicable
- GREEN implementation in chart data service + UI components.
- Exit gate: chart unit/integration tests pass; export regression tests pass.

### Phase 4 Closeout Status (In Progress)
- Status: **In Progress**
- Completed technical slices so far:
  - DIA charts tab added in `DataInputActuals` with config-driven rendering.
  - Bridge charts section added as dedicated sidebar page with category sub-tabs.
  - Year 0 marker support implemented for bridge timeline charts.
  - Chart inventories locked in tests:
    - Bridge chart inventory: `21` charts.
    - DIA chart inventory: `5` charts (includes DSCR/CROA/CROE summaries).
  - Formula fallback transformers implemented and tested for DIA + Bridge.
  - Export parity regression coverage added for:
    - hidden-tab bridge export
    - DIA charts export inclusion.
- Pending gate items before marking completed:
  - User/tester manual validation pass.
  - Post-manual DB/API verification pass.
  - Final phase closeout update from In Progress -> Completed.

### Phase 4 Scope Lock (Must Follow - No Exceptions)
- Implement **additively only**: do not refactor or alter existing `Executive Charts`, `Detailed Analytics Charts`, or `Composite Index Dashboard` logic/components/configs.
- Place **DIA charts** inside `DataInputActuals` as a dedicated `Charts` tab, combining historical + current actuals in this section.
- Add a **new sidebar menu item** directly below `Data Input - Actuals` for **Bridge Charts** and route it to a new dedicated page.
- Keep chart code isolated by feature:
  - DIA charts common code only under `src/features/dia-charts/*`
  - Bridge charts common code only under `src/features/bridge-charts/*`
- Shared utilities between DIA and Bridge must be minimal and explicit; no hidden coupling to legacy chart pages.
- Test architecture is mandatory:
  - fixtures/helpers for DIA and Bridge are separate
  - RED->GREEN->REFACTOR for each slice
  - regression checks to confirm existing chart pages remain unaffected.

## Phase 4A - Chart Placement and Modularization (explicit UX architecture)
- **Data Input Actuals charts location:** add a new `Charts` tab on `DataInputActuals` page (same permission scope as DIA).
- **Bridge charts location:** add dedicated `Bridge Charts` item in left sidebar directly below `Data Input - Actuals` (separate page, not mixed into existing chart pages).
- **Shared chart architecture:** all new charts must use existing modular stack:
  - data fetch service layer (`src/services/api/*`)
  - transformer layer (`src/utils/chartTransformers.ts` + new historical transformers)
  - config-driven chart metadata (`src/config/charts/*`)
  - reusable rendering components (`ChartWithSecondaryAxis`, `ModernChart`)
- **Export parity:** bridge and DIA charts must be included in existing chart export pipeline tests.
- Exit gate: placement + modularity tests and export tests pass.

### Phase 4 Manual Tester Checklist (Required Before Closeout)
- Open `Data Input - Actuals` -> `Charts` tab and verify DIA chart cards render with historical/current demarcation and expected chart count badge.
- Open `Bridge Charts` from sidebar and verify category sub-tabs exist (`Liquidity`, `Solvency`, `Profitability`, `Efficiency`, `Cash Flow`).
- In Bridge charts, verify Year 0 marker is visible at first forecast period for timeline continuity.
- Validate chart-by-chart formatting behavior:
  - percentage charts show `%` formatting,
  - ratio charts show ratio-decimal format,
  - currency charts show rounded grouped numbers.
- Validate mode continuity with real project data:
  - historical actuals appear before current actuals,
  - forecast appears after current boundary.
- Validate export parity:
  - export includes all Bridge charts across tabs (not only active tab),
  - export includes all DIA charts in `Data Input - Actuals` charts tab.
- Regression check (must remain unchanged):
  - `Executive Charts`, `Detailed Analytics Charts`, `Composite Index Dashboard` still load and behave as before.

### Phase 4 DB/API Verification Playbook (Run After Manual Test)
- Verify available periods feeding DIA/Bridge actual timeline:
  - `GET /api/covenant/:projectId/actuals/periods`
  - confirm historical + current periods are present with expected `periodType`.
- Spot-check period payloads used by DIA/Bridge:
  - `GET /api/covenant/:projectId/actuals?year=<Y>&periodType=<monthly|quarterly|annual>&month=<M>`
  - confirm `revenueActual`, `ebitdaActual`, `netProfitActual`, `totalAssetsActual`, cash-flow/debt-service fields are populated as expected.
- Verify actuals KPI payloads used for DSCR/CROA/CROE summaries:
  - `GET /api/actuals/:projectId/kpis?year=<Y>&periodType=<...>&month|quarter=<...>`
  - confirm `debtServiceCoverageRatio`, `cashReturnOnAssets`, `cashReturnOnEquity` values align with tester observations.
- Verify forecast side for bridge continuity:
  - `GET /api/covenant/:projectId/nce-financial-data?year=<forecastYear>&periodType=annual&month=1`
  - `GET /api/covenant/:projectId/nce-kpis?year=<forecastYear>&periodType=annual&month=1`
  - confirm forecast periods continue directly after latest actual year and support Year 0 marker boundary behavior.
- Optional DB spot checks (read-only) if needed for dispute resolution:
  - `covenant_actuals` rows for tested years/periods,
  - `*_actuals_kpis` rows for tested periods.

## Phase 5 - Navigation and UX Cleanup
- Remove/hide `Banking Partners` per approved policy.
- Add integration UX discoverability and tooltips for split routing.
- Exit gate: route/menu tests + access/feature gating tests pass.

## Phase 6 - Hardening, Performance, and E2E Regression
- Golden dataset tests for mixed period/signed values across ingest -> persistence -> KPI -> charts.
- Performance test for 7-year historical imports.
- Exit gate: required suites 100% pass for this feature set before merge.

### Phase 6 Status (Completed)
- ✅ Hardening slice complete: added regression contract for mixed-granularity precedence in bridge timeline collapse (`monthly > quarterly > annual`) and patched bridge data service selection logic.
- ✅ Evidence: `src/__tests__/features/bridge-charts/bridgeChartDataService.hardening.test.ts` (RED->GREEN), plus bridge/export regression suite passes.
- ✅ Performance slice complete: added `INTEGRATIONS_EXCEL_SaveMappedData_Performance_7YearWindowBoundsWorkForLargeBatch` to enforce bounded work for oversized historical batches (process only 7-year window).
- ✅ Phase 6 mini-gate evidence:
  - Backend: `integrationsExcelController.test.js` + `integrationsExcelController.saveMappedData.test.js` -> **32/32 pass**
  - Frontend: bridge hardening + export parity suites -> **4/4 pass**
- ✅ Final Phase 6 closeout gate evidence:
  - Backend closeout suite:
    - `integrationsExcelController.test.js`
    - `integrationsExcelController.saveMappedData.test.js`
    - `quickbooks-save-mapped-data.test.js`
    - `lineItemAutoMapping.test.js`
    - Result: **68/68 pass**
  - Frontend closeout suite:
    - `bridgeChartDataService.hardening.test.ts`
    - `chartExportService.historicalsParity.test.ts`
    - `BridgeChartsPanel.exportParity.test.tsx`
    - `DiaChartsPanel.exportParity.test.tsx`
    - `mappedDataPayloadBuilder.test.ts`
    - `phase4ChartsNavigation.test.ts`
    - `phase5NavigationCleanup.test.ts`
    - Result: **14/14 pass**
- ✅ Exit gate met: required Phase 6 suites are green for this feature set.

---

## 10) Required Test Governance (for all phases)

Must follow:
- `test-suite-system-prompt.md`
- strict TDD (`red -> green -> refactor`)
- stage-gated progression
- 100% pass requirement for required phase tests before moving forward
- evidence logging per gate (commands + pass counts)

Recommended minimum evidence per phase:
- backend targeted tests (`npm test -- --runInBand --testPathPattern=...`)
- frontend targeted tests (`npx vitest run ...`)
- security/permission regressions for affected routes
- export regressions when chart/UI changes are introduced

Mandatory test-suite integration approach for this feature:
- **Backend helpers/fixtures:** use `api-server/tests/helpers/index.js` primitives (`createProjectWithData`, `actualsTestFixture`, `goldenDatasets`, `cleanupTestData`) instead of ad-hoc setup.
- **Frontend helpers/fixtures:** use `src/__tests__/helpers` (`renderWithProviders`, `mockApiService`, `testFixtures`) for consistent isolation and reduced duplication.
- Add end-to-end contract tests that reuse fixtures across:
  1) new company/project bootstrap,
  2) historical import,
  3) KPI generation,
  4) chart rendering/export.
- Keep security regressions as first-class tests (`securityCrossProjectIsolation`, `*Routes.security.test.js` patterns).

---

## 11) Corrections Applied During Assessment

No production code changes made in this assessment.

Corrections made at analysis level:
- Confirmed that existing requirement assumption "Data Inputs tables may be time-dimensioned" is **incorrect** in current live schema.
- Confirmed split routing must leverage DIA (`covenant_actuals`) for historical periods.
- Confirmed QBO mapped-save path currently targets Data Inputs only and must be redesigned for split behavior.
- Confirmed from specs that Historical Integration and FP&A are separate modules with strict period-boundary responsibilities (Historical pre-Year0/bridge vs FP&A Year1+).
- Confirmed Year 0 partial-year annualization is a formal requirement (P&L/CF annualized, BS not annualized).
- Confirmed actuals table structure and volume on both test and primary DB env configurations prior to planning.

---

## 11A) New Company / Project Impact (Second-Pass Audit)

Observed product behavior:
- New project creation runs `projectService.createProject()` and `initializeProjectData()` for Data Inputs baseline tables.
- This bootstrap currently initializes one-row-per-project Data Inputs tables, not historical periodized records.

Impact for this feature:
- Historical module must remain empty for a brand-new project until first historical import (recommended), unless a policy explicitly introduces seeded placeholders.
- Must ensure no historical/FP&A auto-fill behavior injects misleading zero-data rows that can contaminate charts or KPIs.

Required regression tests:
- `HISTORICAL_NewProject_NoHistoricalRowsUntilImport`
- `HISTORICAL_NewProject_ChartsShowEmptyState_NotZeros`
- `HISTORICAL_NewProject_FirstImport_CreatesPeriodizedRowsOnly`

---

## 11B) Security and Best-Practice Documents Checked

Reviewed and incorporated:
- `project_documentation/wip/rule_book_for_new_implementation.md`
- `project_documentation/wip/SECURITY_DATA_ISOLATION_ASSESSMENT.md` (as referenced by rule book)
- `project_documentation/07-standards/SECURITY_STANDARDS.md`
- `project_documentation/07-standards/CODING_STANDARDS.md`

Implementation implications:
- All new tenant-scoped routes must pass route guard audits (`npm run audit:routes`).
- RLS/userId session binding must be preserved for any new DB access paths.
- New route/controller/service code must include project/company authorization consistency checks (no owner-only bypass where collaboration is expected).
- Test strategy must include cross-project isolation regressions.

---

## 11C) Coverage Checklist (Second Pass)

The following concerns are now explicitly covered in this plan:
- [x] Specs considered (`requirements` + Historical spec v4 + FP&A spec v1)
- [x] New company/project bootstrap impact
- [x] Chart placement decisions (DIA vs bridge)
- [x] Modular chart architecture approach
- [x] End-to-end test-suite integration using existing helpers/fixtures
- [x] Security/best-practice standards and route/RLS requirements
- [x] Actuals table checks across test and primary DB configs
- [x] Policy gates for one-go delivery risk control

---

## 14) Decision Lock Table (Approved)

This section records approved policy decisions for Phase 0 closure.

| # | Decision | Approved Choice |
|---|----------|-----------------|
| 1 | Latest-year classification rule | Use `max(year)` from imported dataset; tie-break with latest closed period in that year. |
| 2 | Overwrite strategy on collisions | `upsert` with explicit user confirmation + audit entry (no silent overwrite). |
| 3 | Sign handling contract | Hybrid: store canonical normalized values for calculations and preserve raw source sign/value in import audit metadata. |
| 4 | Integrations Excel workbook layout | One workbook; rows are financial line items, columns are periods (year/month/quarter). |
| 5 | Integrations UI placement | Add under Integrations as `Excel Upload` (alongside QuickBooks flow). |
| 6 | Chart demarcation style | Segmented series + vertical boundary marker + explicit legend tags for historical/current/forecast. |
| 7 | Banking Partners removal scope | Hide from sidebar navigation now; route deprecation can be handled in controlled follow-up. |
| 8 | 7-year cap behavior | Import newest 7 years; warn user and show dropped-year summary. |
| 9 | Year-0 partial-year annualization trigger | Ingest source values as-is first; compute annualized Year-0 as derived layer by default (visible label), with manual override support. |
| 10 | Historical vs FP&A period boundary | Strict boundary: Historical module owns pre-Year0 + Year0 bridge; FP&A owns Year1+ actuals/budget/reforecast. |
| 11 | KPI behavior without Cash Flow | Follow spec: KPIs 28-32 show `N/A` when Cash Flow inputs are missing. |
| 12 | New project bootstrap for historicals | Keep historical partitions empty until first import (no placeholder zero history rows). |

### Note on Decision #9 (Source fidelity)

Approved interpretation:
- **Yes, always load/store exactly what comes from source** (connector/Excel/manual) in raw import lineage.
- Annualized Year-0 is a **derived analytical layer** used for bridge/comparison logic and clearly labeled.
- Raw source and derived annualized values must both remain traceable in audit history.

---

## 15) Mock-to-Implementation Mapping (Charts)

Reference mock:
- `project_documentation/wip/historicals/kpi_dashboard_historical_forecast.html`

Important:
- This mapping treats the HTML as a **UI behavior and chart inventory reference only**.
- Production implementation must use existing app architecture (services -> transformers -> config -> reusable chart components), not direct HTML/CDN patterns.

### Target placement
- **Data Input Actuals charts:** new `Charts` tab inside `DataInputActuals`.
- **Bridge / historical+forecast timeline charts:** new `Bridge` category under `DetailedAnalytics`.

### Implementation stack to use
- **Data sources:** `src/services/api` (extend with historical/bridge endpoints as needed)
- **Transformers:** `src/utils/chartTransformers.ts` (add historical-aware transformer set)
- **Chart config:** `src/config/charts/*` (new config modules for bridge set)
- **Renderers:** `src/components/charts/ChartWithSecondaryAxis.tsx`, `src/components/charts/ModernChart.tsx`

### Chart inventory mapping

| Category | Chart | Target UI | Primary Data Sources | Transformer/Config Target | RED test target |
|---|---|---|---|---|---|
| Liquidity | Current Ratio + Working Capital | Bridge (`DetailedAnalytics`) | KPI + cash flow/working capital | `chartTransformers` + liquidity config | `src/__tests__/pages/DetailedAnalytics.historicalBridge.test.tsx` |
| Liquidity | Quick Ratio | Bridge | KPI + balance sheet | `chartTransformers` + liquidity config | same file |
| Solvency | Debt/EBITDA + Debt | Bridge | KPI + debt/balance sheet | `chartTransformers` + solvency config | same file |
| Solvency | Net Debt/EBITDA + Debt + Cash | Bridge | KPI + debt + cash | `chartTransformers` + solvency config | same file |
| Solvency | DSCR | Bridge + DIA summary | KPI + CF debt service fields | `chartTransformers` + solvency config | `src/__tests__/pages/DataInputActuals.historicalCharts.test.tsx` + bridge test |
| Solvency | Interest Coverage (Asset Light) | Bridge | KPI + P&L | `chartTransformers` + solvency config | bridge test |
| Solvency | Interest Coverage (Asset Heavy) | Bridge | KPI + P&L | `chartTransformers` + solvency config | bridge test |
| Solvency | LTV | Bridge | KPI + balance sheet/debt | `chartTransformers` + solvency config | bridge test |
| Profitability | Gross Profit Margin + Revenue + GP | Bridge | KPI + P&L | `chartTransformers` + profitability config | bridge test |
| Profitability | Operating Profit Margin + EBIT | Bridge | KPI + P&L | `chartTransformers` + profitability config | bridge test |
| Profitability | Net Profit Margin + Revenue | Bridge | KPI + P&L | `chartTransformers` + profitability config | bridge test |
| Profitability | ROA + Net Income | Bridge | KPI + P&L + balance sheet | `chartTransformers` + profitability config | bridge test |
| Profitability | ROE | Bridge | KPI + balance sheet | `chartTransformers` + profitability config | bridge test |
| Profitability | ROCE | Bridge | KPI + P&L + balance sheet | `chartTransformers` + profitability config | bridge test |
| Efficiency | Inventory Turnover + COGS | Bridge | KPI + P&L + balance sheet | `chartTransformers` + efficiency config | bridge test |
| Efficiency | Receivables Turnover + Revenue | Bridge | KPI + P&L + balance sheet | `chartTransformers` + efficiency config | bridge test |
| Efficiency | Payables Turnover + COGS | Bridge | KPI + P&L + balance sheet | `chartTransformers` + efficiency config | bridge test |
| Efficiency | Fixed Asset Turnover + Revenue | Bridge | KPI + P&L + balance sheet | `chartTransformers` + efficiency config | bridge test |
| Cash Flow | Free Cash Flow + Debt trend | Bridge | CF + debt + KPI | `chartTransformers` + cash-flow config | bridge test |
| Cash Flow | CROA | Bridge + DIA summary | CF + assets | `chartTransformers` + cash-flow config | DIA + bridge tests |
| Cash Flow | CROE | Bridge + DIA summary | CF + equity | `chartTransformers` + cash-flow config | DIA + bridge tests |

### Shared behavior mapping (from mock to product)

| Mock behavior | Product implementation requirement | RED test target |
|---|---|---|
| Combined / Historical-only / Forecast-only modes | Add mode selector in bridge charts; filter transformer output by source bucket (`H`,`F`,`combined`) | `DetailedAnalytics.historicalBridge.test.tsx` |
| Year-0 dashed boundary marker | Add explicit vertical marker + label where Year-0 exists | same file |
| Historical vs Forecast style demarcation | Keep color/token pairs per series class with legend labels | same file |
| Tooltip semantics | Use existing formatter utilities with consistent units (`x`, `%`, `K/M`) | `src/__tests__/components/charts/ModernChart.historicalMode.test.tsx` |
| Export parity | Ensure bridge/DIA charts included in export and preserve marker/demarcation | `src/__tests__/pages/Reports.pdfChartExport.historicalBridge.test.tsx` |

### Required backend support mapping

| Need | Current status | Planned action | RED test target |
|---|---|---|---|
| Historical + forecast unified timeline payload | Not currently first-class endpoint | Add aggregation endpoint/service with strict period boundary logic | `api-server/__tests__/features/historicals-bridge-charts.test.js` |
| Source bucket tagging (`historical`, `year0`, `forecast`) | Not currently explicit | Add tagged response contract | same file |
| Year-0 annualized labeling metadata | Not explicit in chart API | Include `isAnnualized` and `annualizedMonths` fields for bridge period | same file |
| CF-dependent KPI availability flags | Partial behavior exists | Ensure API emits `N/A` metadata for KPI 28-32 when CF absent | `api-server/__tests__/features/historicals-kpi-availability.test.js` |

---

## 16) Third-Pass Requirement Traceability (CRITICAL Audit Recheck)

This section is an explicit line-by-line recheck against `project_documentation/wip/historicals/requirements`.

| Requirement line | Coverage status | Where covered in plan | Recheck result |
|---|---|---|---|
| Latest year -> Data Inputs; prior years -> Actuals | Covered | Decision #1, #2, #10 + Phases 1/2 | PASS |
| Historical P&L in simple mode | Covered with implementation note | Phase 3 Excel path + bridge chart config constraints | PASS (implementation detail to enforce in UI) |
| Build DIA charts | Covered | Target placement + chart mapping (Section 15) | PASS |
| Build DIA + historical + forecast with demarcation | Covered | Decision #6 + Section 15 shared behavior mapping | PASS |
| Remove Banking Partners tab | Covered | Decision #7 + Phase 5 | PASS |
| Monthly/quarterly/annual routing into DIA | Covered | Decision #4 + Phase 1 + API/data model audit | PASS |
| Confirm same or separate table for monthly/quarterly/annual | Covered | Live DB validation: same `covenant_actuals` table with `period_type` + periodized KPI tables | PASS |
| QBO split: old years DIA, latest year Data Inputs | Covered | Decision #1/#10 + Phase 2 QBO refactor | PASS |
| Add Integrations Excel upload section | Covered | Decision #5 + Phase 3 | PASS |
| Handle signs from QBO/Excel | Covered | Decision #3 + DB sign consistency audit | PASS |
| Process up to 7 years historical | Covered | Decision #8 + Phase 3 validation | PASS |

### Additional CRITICAL prompt checks revalidated

- **Live DB first:** completed on both `.env.test` and `.env` configs (table/row/constraint/period distribution checks).
- **Backend paths/permissions:** revalidated on real route middleware (`projectAccess`, `requireProjectFeature`) and endpoint ownership.
- **Hidden dependency traps:** reconfirmed for QBO staging tables without direct `project_id` (scope via `qbo_connections`), one-row-per-project Data Inputs constraints, and bootstrap side effects.
- **API trigger endpoints + auth:** reconfirmed for `quickbooks`, `actuals`, `project csv upload`, `new-calculation-engine`, and `covenant` routes.
- **Policy-gate closure:** all 12 decision points now approved and locked.

### Third-pass certainty verdict

- Requirement traceability coverage: **11/11 PASS**
- Policy decisions: **12/12 LOCKED**
- Implementation posture: **READY TO START PHASE 1 (TDD RED)**

---

## 12) Residual Risks

- Misclassified latest-year policy can cause silent data placement errors.
- Sign-rule mistakes can propagate into DSCR/margin/KPI/chart inaccuracies.
- Permission mismatch across integration routes can break team workflows.
- Chart demarcation without contract tests can regress exports.

---

## 13) Implementation Readiness Verdict

**READY (PHASE-GATED)** to begin implementation with strict TDD from Phase 1.

Conditions:
- Follow stage gates and evidence logging exactly.
- Do not skip security route/RLS regression tests.
- Do not bypass fixture-based test setup for new suites.

