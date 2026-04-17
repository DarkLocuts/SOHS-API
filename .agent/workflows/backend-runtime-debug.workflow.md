---
description: Backend Runtime Debug Workflow
---

# Backend Runtime Debug Workflow

Version: 1.0.0

This workflow defines a strict, feature-driven, and schema-governed
**runtime debugging process for a backend project using Elysia-Light**.

The agent MUST obey workspace boundaries, feature scope, test rules, and artifact rules.
No inference, exploration, or architectural changes are allowed.

This workflow **explicitly uses runtime tests** as the primary observation tool.

---

## WORKSPACE DIRECTORY MAPPING

This project contains multiple bounded workspaces.

### Backend Workspace

* Root directory: `./`
* Purpose: API routes, controllers, services, middleware, runtime logic

### Test Workspace

* Root directory: `./test`
* Purpose: runtime API tests used to reproduce and observe failures

### Agent Artifacts (Shared)

* Contents:

  * `.agent/artifacts/debug-features.artifact.json` (HUMAN-OWNED, read-only)
  * `.agent/artifacts/bugs.artifact.json` (shared source of truth)

The agent MUST NOT:

* Modify files outside `./`
* Modify frontend code
* Modify infrastructure or deployment configuration
* Modify `debug-features.artifact.json`

---

## GLOBAL CONSTRAINTS

* `debug-features.artifact.json` defines WHAT backend features exist
* `api.schema.json` defines HOW features are exposed
* `bugs.artifact.json` defines WHAT is broken

The agent MUST NOT:

* Invent features, routes, or APIs
* Expand feature scope
* Bypass runtime tests during debugging

All fixes MUST be minimal, scoped, and test-verifiable.

---

## ARTIFACT WRITE PROTOCOL

When writing or updating any artifact file:

1. The agent MUST follow the corresponding JSON schema:

   * `.agent/artifacts/bugs.artifact.json` → `schemas/bugs.schema.json`

2. The agent MUST ensure field names, nesting, and data types
   exactly match the schema definition.

3. If the agent is unable to guarantee schema validity:

   * DO NOT write the artifact
   * Report schema mismatch
   * Mark related bug as `need_human`

4. Any invalid artifact write MUST abort the workflow immediately.

---

## STAGE 1 — BACKEND RUNTIME DEBUG

### Step 1.1 — ENVIRONMENT PREPARATION

Before running runtime tests:

* Ensure backend is built (if applicable)
* Ensure backend runtime is started (dev or test mode)
* Ensure test dependencies are available

---

### Step 1.2 — TEST GENERATION (MANDATORY)

For each reported or observed backend runtime failure:

* Identify the affected feature and API endpoint
* Check `/test` for an existing test file

If no relevant test exists:

* Generate a **feature-scoped runtime test file** in `/test`

Rules:

* One feature → one test file
* Tests MUST call real API endpoints
* Tests MUST be deterministic and reproducible
* Tests MUST NOT mutate persistent data unless explicitly allowed

---

### Step 1.3 — RUNTIME BUG ANALYSIS

* Apply skill: `backend_analyze_runtime_bug`
* Execute the related test file to reproduce the failure
* Capture:

  * HTTP status
  * response payload
  * error message
  * stack trace (if available)

Validation:

* Feature exists
* API endpoint exists

If valid:

* Append bug entry to `.agent/artifacts/bugs.artifact.json`
* Set:

  * `layer = "backend"`
  * `type = "runtime_error"`
  * `status = "open"`
  * `source = "ai"`
  * `test_file = "/test/<feature>.test.ts"`

---

### Step 1.4 — RUNTIME BUG FIX

For each OPEN backend runtime bug:

* Apply skill: `backend_fix_runtime_bug`

Rules:

* Fix MUST be minimal
* Fix MUST stay inside the affected feature boundary
* Fix MUST NOT introduce new endpoints or behavior

After fixing:

* Re-run the related test file

---

### Step 1.5 — BUG STATUS UPDATE

If runtime failure is resolved:

* Update bug status → `fix`
* Record:

  * modified file(s)
  * line number(s)
  * test file used for verification

If fix requires:

* data migration
* contract changes
* cross-feature logic

Then:

* Update bug status → `fix_but_need_human`

---

### Step 1.6 — RE-VERIFICATION

* Re-run all related runtime tests for the feature
* Append any remaining valid runtime bugs

---

## STAGE 2 — FINALIZATION

Workspace: `.agent/artifacts`

### Step 2.1

For all bugs marked `fix`:

* Verify related runtime test exists
* Verify test passes

### Step 2.2

Leave bugs with status:

* `fix_but_need_human`
* `need_human`

These require explicit human intervention.

The agent MUST NOT mark bugs as done without runtime test verification.

---

## ENFORCEMENT STATEMENT

This workflow is binding for:

* backend runtime debug agents
* test-generating agents
* human reviewers

Any backend runtime fix without a reproducing test
is considered INVALID.

---

## END OF WORKFLOW
