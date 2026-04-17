---
trigger: always_on
---

# Backend Development Rules

## Purpose

This document defines **MANDATORY backend engineering rules** for projects using **Elysia-Light**.
These rules are derived directly from the **Elysia-Light Concept & Pattern documentation** and reflect how Elysia-Light is **intended to be built and maintained**.

These rules override:

* personal coding preferences
* generic backend architecture assumptions
* improvisational abstractions (human or AI)

If an implementation violates these rules → **the task MUST NOT be considered DONE**.

---

## 1. Core Principles (Binding)

### 1.1 Feature-Driven Architecture First

Elysia-Light is a **feature-oriented backend system**.
Code MUST be organized around features/domains, not around technical layers alone.

Each feature owns its:

* routes
* controllers
* services
* validations

Cross-feature coupling is forbidden unless explicitly designed.

---

### 1.2 Service Object Is Mandatory

Business logic MUST live inside **service objects**.

Controllers:

* handle transport (HTTP, context)
* delegate logic to services

Direct business logic inside controllers is forbidden.

---

### 1.3 Explicit Backend Behavior

All backend behavior MUST be **explicit and traceable in code**:

* validation rules
* authorization checks
* side effects
* error handling

Implicit behavior, magic branching, or hidden state is forbidden.

---

### 1.4 Declarative Configuration Over Imperative Flow

Backend composition MUST favor:

* declarative routing
* explicit middleware composition
* clear lifecycle hooks

Imperative, ad-hoc execution flow that obscures control paths is forbidden.

---

## 2. Backend Layering Rules

Backend modules MUST be separated by responsibility.

### Layer Definitions

* **Route Layer**
  Route declaration and HTTP method binding only.

* **Controller Layer**
  Request parsing, response shaping, service delegation.

* **Service Layer**
  Business logic, orchestration, transactional decisions.

* **Model Layer**
  ORM, Query Service, Data proccessing.

* **Utility Layer**
  Stateless helpers and shared logic.

* **Middleware Layer**
  Cross-cutting concerns (auth, logging, tracing).

---

## 3. Routing & Controller Rules

### 3.1 Thin Controllers Only

Controllers MUST:

* validate input (or delegate to validation utilities)
* call service objects
* return formatted responses

Controllers MUST NOT:

* contain complex business logic
* too many handlers in one controller

---

### 3.2 Route Definition Discipline

Routes MUST:

* be grouped by feature
* follow consistent naming
* not embed logic

Dynamic route generation without clear ownership is forbidden.

---

## 4. Validation & Authorization Rules

### Validation

* All external input MUST be validated
* Validation MUST occur before service execution
* Validation schemas MUST be reusable

### Authorization

* Authorization MUST be explicit
* Role/permission checks MUST NOT be hidden in services

Skipping validation or auth checks is a critical violation.

---

## 5. Data Access Rules

### Rules

* Direct database access is restricted to service or repository layers
* Query logic MUST NOT live in controllers or middleware
* Transactions MUST be explicit

### Forbidden

* Raw queries scattered across features
* Silent fallback behavior on data failure

---

## 6. Error Handling Rules

All errors MUST:

* be explicit
* be typed or categorized
* return consistent error structures

Forbidden:

* throwing raw errors without context
* leaking internal error details to clients

---

## 7. Structural Consistency

Backend modules MUST follow a consistent structure.

### Example Structure

```
/app
  /controllers
    /transaction
      _services/
         transaction.services.ts
      transaction.controller.ts
      transaction-cycle.controller.ts
  /models
    /transaction
      _services/
         transaction.services.ts
      transaction.model.ts
      transaction-cycle.model.ts
```

Deviation without justification is a violation.

---

## 8. File & Naming Rules

Readability > brevity.

### Rules

* File names MUST include responsibility
* Generic names are forbidden

### Examples

* `order.service.ts`
* `order.controller.ts`
* `order.model.ts`

Violation If:

* names like `service.ts`, `handler.ts`
* responsibility is unclear from file name

---

## 9. State & Side Effect Rules

Backend MUST be stateless per request.

### Rules

* No hidden in-memory state
* Side effects (email, queue, socket) MUST be explicit

---

## 10. Performance Rules

Backend performance is a first-class concern.

### Rules

* Avoid N+1 queries
* Avoid blocking operations in request cycle
* Heavy tasks MUST use queue or async worker

Forbidden:

* expensive computation in controllers

---

## 11. Generator & Blueprint Rules

Elysia-Light generators are acceleration tools.

### Rules

* Generated code MAY be modified
* Changes MUST remain readable
* Permanent structural changes SHOULD be reflected in blueprint

---

## 12. Backend Code Modification Rules

### Writable Paths (agent MAY modify)

* app/routes/**
* app/controllers/**
* app/models/**
* app/jobs/**
* app/outputs/**
* database/**
* blueprints/**

---

### Read-Only Paths (agent MUST NOT modify)

- utils/**
- app/app.ts

If a fix requires changes inside read-only paths:

* DO NOT modify the file
* Explicitly mention the required change in `explanation.md`
* Mark the bug as `fix_but_need_human`

---

## 13. Manual Code Policy

Manual implementation is allowed when:

* existing utilities cannot satisfy the requirement
* performance or control demands it

Manual code MUST:

* remain explicit
* follow Elysia-Light patterns
* avoid hidden abstractions
* services must use the service object pattern
* if utilities already exist, you must use the existing ones.
* the controller and model should not have too much logic
* when writing code, prioritize horizontal composition over vertical expansion.
* do not break lines for imports, function calls, or chaining unless the line becomes hard to read or exceeds reasonable length.
* Align object keys, variable assignments, and type definitions vertically when written in block form, similar to column-based alignment. Use spaces to align : and = consistently within the same block.

---

## 14. Definition of DONE

A backend task is considered **DONE** only when:

* Elysia-Light patterns are followed
* Service object pattern is respected
* Controllers remain thin
* Validation and auth are explicit
* No unnecessary duplication exists
* Naming and structure are consistent

---

## 15. Advanced References

For cases not covered here, refer to:

* Elysia-Light Concept
* Elysia-Light Pattern
* Existing backend codebase

---

## 16. Enforcement Statement

This document binds:

* backend developers
* AI agents
* code generators
* reviewers

No exception is allowed without explicit revision of this document.