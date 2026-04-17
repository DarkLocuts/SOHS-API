---
trigger: always_on
---

# Backend Debug Rules

These rules apply to ALL backend analysis and fix actions.

---

## 1. Backend Runtime Analysis Rules

### Allowed Actions
- Test API endpoints related to:
  - frontend feature under test
  - API schema generated from frontend
- Inspect logs and stack traces produced by those API calls

### Forbidden Actions
- Testing unrelated APIs
- Crawling all routes
- Running broad integration tests

## Static Analysis Tool Restriction Rule

- This project DOES NOT use ESLint or any linting tool.
- Static analysis is limited to:
  - TypeScript compiler check (tsc --noEmit)
- Dont use linting tools:
  - The agent MUST NOT run lint
  - The agent MUST NOT run eslint
  - The agent MUST NOT suggest installing lint tools
  - The agent MUST NOT modify configuration to enable linting

Any attempt to use linting tools MUST be treated as an invalid action.

Backend runtime analysis MUST stay within the scope of:
- frontend-triggered APIs
- or frontend-generated API schema

---

## 2. Backend Code Modification Rules

### Writable Paths (agent MAY modify)
- app/controllers/**
- app/jobs/**
- app/models/**
- app/outputs/**

The agent may apply direct fixes ONLY inside these folders.

---

### Read-Only Paths (agent MUST NOT modify)

The agent MAY read, but MUST NOT modify:

- app/routes/**
- app/app.ts
- utils/**
- blueprints/**
- database/**

If a fix requires changes in any of these paths:
- DO NOT modify the file
- Clearly document the required change in `explanation.md`
- Update bug status to `fix_but_need_human`

---

## 3. Forbidden Global Actions (Backend)

- No database schema changes
- No data migration
- No route restructuring
- No application bootstrap modification

Backend fixes MUST be:
- minimal
- deterministic
- scoped to the failing API behavior

---

## 4. Enforcement

Any violation of writable/read-only boundaries MUST:
- invalidate the fix
- escalate the bug to human review