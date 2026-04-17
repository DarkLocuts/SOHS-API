---
description: Backend Static Debug Workflow
---

# Backend Static Debug Workflow

Version: 1.1.0

This workflow defines a strict, feature-driven, schema-governed
**static debugging process for a backend project using Elysia-Light**.

This workflow explicitly **DOES NOT use runtime tests**.
All analysis is static-only (type-level, structure-level, contract-level).

The agent MUST obey workspace boundaries, feature scope, and artifact rules.
No inference, exploration, or architectural changes are allowed.

---

## WORKSPACE DIRECTORY MAPPING

This project contains multiple bounded workspaces.

### Backend Workspace

* Root directory: `./`
* Purpose: API routes, controllers, services, middleware, utilities

### Agent Artifacts (Shared)

* Contents:

  * `.agent/artifacts/debug-features.artifact.json` (HUMAN-OWNED, read-only)
  * `.agent/artifacts/bugs.artifact.json` (shared source of truth)

The agent MUST NOT:

* Modify files outside `./`
* Modify frontend code
* Modify infrastructure or deployment configuration
* Create or modify runtime test files
* Modify `debug-features.artifact.json`

---

## GLOBAL CONSTRAINTS

* `feature.schema.json` defines WHAT backend features exist
* `bugs.artifact.json` defines WHAT is broken
* Static analysis defines HOW issues are detected

The agent MUST NOT:

* Invent features, routes, or APIs
* Expand feature scope
* Execute or generate runtime tests

All fixes MUST be minimal, scoped, and statically verifiable.

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

## STAGE 1 — BACKEND STATIC DEBUG

### Step 1.1

Run backend static analysis ONLY inside `./`

* Apply skill: `backend_analyze_static_bug`

Static analysis MAY include:

* TypeScript type checking
* Schema mismatches
* Unsafe null / undefined access
* Pattern or contract violations detectable without execution

---

### Step 1.2 — STATIC BUG REGISTRATION

If static errors are found:

* Append new entries to `.agent/artifacts/bugs.artifact.json`
* Set:

  * `layer = "backend"`
  * `type = "static_error"`
  * `status = "open"`
  * `source = "ai"`

---

### Step 1.3 — STATIC BUG FIX

For each OPEN backend static bug:

* Apply skill: `backend_fix_static_bug`

Rules:

* Fix MUST be minimal
* Fix MUST stay inside the affected feature boundary
* Fix MUST NOT introduce new behavior
* Fix MUST be justifiable via static reasoning

---

### Step 1.4 — BUG STATUS UPDATE

If static issue is resolved:

* Update bug status → `fix`
* Record:

  * modified file
  * line numbers
  * static reason for resolution (type satisfied, contract aligned, etc.)

If fix requires:

* runtime validation
* cross-feature changes
* architectural adjustment

Then:

* Update bug status → `fix_but_need_human`

---

## STAGE 2 — FINALIZATION

Workspace: `.agent/artifacts`

### Step 2.1

For all bugs marked `fix`:

* Verify no runtime tests were created or executed
* Verify fix is explainable by static analysis alone

### Step 2.2

Leave bugs with status:

* `fix_but_need_human`
* `need_human`

These require explicit human intervention.

The agent MUST NOT mark bugs as done without static justification.

---

## ENFORCEMENT STATEMENT

This workflow is binding for:

* backend static debug agents
* human reviewers

Any backend static fix that relies on runtime behavior
is considered INVALID.

---

## END OF WORKFLOW
