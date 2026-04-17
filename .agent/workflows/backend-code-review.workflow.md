---
description: Backend Code Review Workflow
---

# Backend Code Review Workflow

version: 1.0.0

This workflow defines a **strict, non-destructive code review process**
for backend projects using **Elysia-Light**.

The workflow ensures that **code structure, file placement,
responsibility boundaries, and architectural patterns** conform to Elysia-Light conventions.

---

## WORKSPACE

* Backend Workspace: `./`
* Artifacts Directory: `.agent/artifacts`

The reviewer agent MUST NOT:

* Modify frontend code
* Change API behavior or contracts
* Expand feature scope
* Introduce new endpoints

---

## GLOBAL RULES

* Elysia-Light patterns are authoritative
* Structure correctness outweighs stylistic preference
* Refactor scope MUST be minimal, mechanical, and traceable
* Review focuses on **how code is organized**, not what it does

---

## STAGE 1 — STRUCTURE ANALYSIS

### Step 1.1

Scan backend folder and file structure recursively.

### Step 1.2

Compare structure against Elysia-Light patterns:

* route placement
* controller location
* service and utility boundaries
* middleware separation
* test folder isolation (if present)

### Step 1.3

Generate structure analysis report.

Artifact:

* `.agent/artifacts/bugs.artifact.json`

Gate:

* No code changes at this stage
* All findings MUST be reported
* Set type of bug `pattern`

---

## STAGE 2 — NAMING & RESPONSIBILITY REVIEW

### Step 2.1

Analyze file and folder naming conventions:

* route naming
* controller naming
* service naming
* utility naming

### Step 2.2

Analyze responsibility boundaries:

* controller should not have much logic
* service should not handle transport concerns
* middleware should be cross-cutting only

### Step 2.3

Detect pattern violations:

* mixed concerns
* misplaced files
* missing service layer
* duplicated logic across controllers

Artifact:

* `.agent/artifacts/bugs.artifact.json`

Gate:

* Violations MUST be explicit
* Each violation MUST reference file and responsibility
* Set type of bug `pattern`

---

## STAGE 3 — CODEBASE REVIEW

### Step 3.1

Analyze backend source code.

### Step 3.2

Detect deeper architectural violations:

* controller contains domain logic
* service bypasses validation or auth layer
* middleware performing business decisions
* inconsistent error handling patterns
* direct database access outside repository / service layer

Artifact:

* `.agent/artifacts/bugs.artifact.json`

Gate:

* Each violation MUST be concrete and traceable
* Set type of bug `pattern`

---

## STAGE 4 — STRUCTURAL ALIGNMENT

### Step 4.1

Apply skill: `backend_code_review`

### Step 4.2

Refactor code to align with Elysia-Light patterns:

* move files
* rename files or folders
* split responsibilities

Rules:

* NO behavior change
* NO API contract changes
* NO new endpoints or features
* Refactor MUST be structural only

Artifacts:

* `.agent/artifacts/bugs.artifact.json`

---

## STAGE 5 — VERIFICATION

### Step 5.1

Verify:

* all reported pattern violations are resolved
* no new violations introduced
* directory structure matches Elysia-Light guidance

Artifact:

* `.agent/artifacts/bugs.artifact.json`

Gate:

* All checks MUST pass

---

## STAGE 6 — COMPLETION

The review is considered **DONE (Backend)** when:

* Structure aligns with Elysia-Light patterns
* Naming is consistent and meaningful
* Responsibility boundaries are clear
* No API behavior changed
* All artifacts are generated

---

## FAILURE POLICY

* Any unresolved violation MUST be reported
* Reviewer MUST NOT silently ignore issues
* Ambiguous cases MUST be marked `need_human`

---

## ENFORCEMENT STATEMENT

This workflow is binding for:

* AI backend reviewers
* human reviewers
* automated structural refactor agents

Any deviation from this workflow is considered INVALID.
