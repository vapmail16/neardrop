# Critical End-to-End Audit Prompt (Reusable)

Use this prompt when you want a high-rigor, low-miss-risk assessment before implementing a critical feature.

## Reusable Prompt

```text
You are doing a CRITICAL end-to-end pre-implementation audit for [FEATURE NAME].

Goal:
Produce an implementation-safe plan with maximum coverage and minimum risk of missed tables/routes/dependencies.

Mandatory process (do all, no shortcuts):
1) Validate against LIVE DATABASE first (information_schema + constraints + enums + row counts where relevant).
2) Validate against backend code paths (routes, controllers, services, permission middleware).
3) Validate against migrations/docs/tests and reconcile any mismatch in favor of live product behavior.
4) Enumerate all project-scoped/company-scoped objects and classify each explicitly:
   - MUST COPY
   - REGENERATE
   - NEVER COPY
   - CONDITIONAL (with business decision required)
5) Detect hidden dependency traps:
   - tables without direct project_id (join/mapping-required scope)
   - one-row-per-project unique constraints
   - auto-initialization side effects
   - FK remap requirements
   - permission/bootstrap requirements
6) Verify API trigger endpoints and required auth/feature permissions from real routes.
7) Update the SAME existing assessment document only (no new .md files unless explicitly instructed).
8) Append issue(s) to ISSUES_LOG and update REMAINING_TEST_WORK with what was found/fixed.
9) If anything is ambiguous, add explicit "Policy Decision Required" gates before implementation.
10) Provide final output with:
   - all findings by severity
   - exact corrections applied
   - residual risks
   - implementation readiness verdict (READY / NOT READY).
11) Add delivery-governance requirements explicitly:
   - follow `test-suite-system-prompt.md`
   - strict TDD (red -> green -> refactor) per phase
   - stage-gated progression
   - 100% pass requirement for required tests at each stage before moving to next stage
   - evidence logging (commands + pass counts) per gate.

Constraints:
- No assumptions without verification from live schema/code.
- Do not skip edge cases.
- Do not commit/push.
```

## How To Invoke In Future

### Option 1: Reference this file in chat (recommended)
In Cursor chat, use:

```text
Please run a critical audit for [FEATURE NAME] using @CRITICAL_E2E_AUDIT_PROMPT.md
```

### Option 2: Paste as your message directly
Copy the "Reusable Prompt" block and replace `[FEATURE NAME]`.

### Option 3: Use as a system-style preface for a session
Start chat with:

```text
Follow @CRITICAL_E2E_AUDIT_PROMPT.md exactly for this session.
Feature: [FEATURE NAME]
```

## Suggested Usage Pattern

1) Ask for audit only (no implementation).  
2) Review findings and unresolved policy decisions.  
3) Confirm decisions.  
4) Then ask for TDD implementation.
