---
description: Backend Development Workflow
---

# Backend Development Workflow

version: 1.0.0

This workflow defines a **backend planning and development**
process for a backend project with **Elysia-Light**.

The agent MUST obey workspace boundaries, feature scope, and artifact rules.
No inference, exploration, or architectural changes are allowed.

This workflow assumes:

* The prompt is already clear and approved
* Feature scope is already agreed
* Architecture and patterns are already defined by Elysia-Light

The agent MUST implement **only what is explicitly stated in the prompt**.

---

## WORKSPACE DIRECTORY MAPPING

### Backend Workspace

* Root directory: `./`
* Purpose: API services, controllers, middleware, utilities, domain logic, etc

### Agent Artifacts

* Directory: `.agent/artifacts`
* Contents:

  * `plans.artifact.json`
  * `api-contracts.artifact.json`
  * `backend-diff.patch`

The agent MUST NOT:

* Modify files outside `./`
* Modify frontend code
* Modify infrastructure or deployment files

---

## GLOBAL CONSTRAINTS

* Prompt defines **WHAT to build**
* Existing backend code defines **HOW it integrates**
* Architecture MUST follow Elysia-Light patterns

The agent MUST NOT:

* Expand feature scope
* Invent new domains or responsibilities
* Change existing API contracts unless explicitly instructed
* Perform architectural refactors

All work MUST be minimal and traceable to the prompt.

---

## ARTIFACT WRITE PROTOCOL

When writing artifacts:

1. The agent MUST follow the corresponding JSON schema:

   * `.agent/artifacts/plans.artifact.json` → `schemas/plans.schema.json`
   * `.agent/artifacts/api-contracts.artifact.json` → `schemas/api-contracts.schema.json`
   * `.agent/artifacts/bugs.artifact.json` → `schemas/bugs.schema.json`

2. All artifacts MUST be:

   * explicit
   * deterministic
   * directly traceable to the prompt

3. The agent MUST ensure field names, nesting, and data types
   exactly match the schema definition.

4. If any ambiguity exists:

   * DO NOT implement
   * Mark as `need_human`

5. Any invalid artifact write MUST abort the workflow immediately.

---

## STAGE 1 — BACKEND DEVELOPMENT PLANNING

### Step 1.1

Apply skill: `backend_development_plan`

### Step 1.2

Define explicitly:

* affected API endpoints
* HTTP methods and routes
* request schema (params, query, body)
* response schema (success and error)
* involved controllers
* involved services / utilities
* middleware and guards applied
* validation and authorization rules
* error and edge-case behavior

Produce artifacts:

* `.agent/artifacts/plans.artifact.json`
* `.agent/artifacts/api-contracts.artifact.json`

Gate:

* Plan MUST map 1:1 with the prompt
* No assumptions or extensions allowed

---

## STAGE 2 — BACKEND DEVELOPMENT IMPLEMENTATION

### Step 2.1

Apply skill: `backend_development`

Rules:

* Implement ONLY what exists in the plan
* Follow Elysia-Light structure and patterns
* No refactor unless strictly required to fulfill the plan
* No change to unrelated endpoints or logic

Produce artifact:

* `.agent/artifacts/backend-diff.patch`

---

## STAGE 3 — IMPLEMENTATION VERIFICATION

### Step 3.1

Verify:

* API behavior matches the prompt
* Request and response match the declared contract
* Middleware and validation are applied correctly
* No extra functionality introduced
* No unrelated files modified
* check and fix bugs with static debug workflow

Gate:

* Any deviation MUST be marked `need_human`

---

## STAGE 4 — COMPLETION

The feature is considered **DONE (Backend)** when:

* Planning artifacts exist
* API contract artifact exists
* Diff is minimal and scoped
* Implementation matches the prompt
* No frontend or infrastructure changes exist

---

## FAILURE POLICY

* Any gate failure STOPS the workflow
* Fixes MUST occur at the originating stage
* Guessing is forbidden

---

## UPDATE PLANNING STATUS

Update status and status details in:

* `.agent/artifacts/plans.artifact.json`

---

## ENFORCEMENT STATEMENT

This workflow is binding for:

* backend agents
* human reviewers

Correct output that does not strictly follow the prompt
is considered INVALID.