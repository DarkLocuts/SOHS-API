---
name: backend_development_plan
description: Convert Elysia-Light design decisions into an explicit implementation plan.
---

# Backend Development Plan

## Goal
Translate approved design decisions into a concrete, step-by-step implementation plan
without writing final code.

## Allowed Tools
- Read Elysia-Light reference
- Read Elysia-Light patterns
- Read api-contracts.artifact.json.
- Read backend source files
- Inspect module structure

## Steps
1. Identify files to be created or modified.
2. Define execution flow and data flow.
3. Validate the plan against Elysia-Light patterns.
4. Read api-contracts.artifact.json.
5. Include plans.artifact.json as a required artifact.

## Forbidden Actions
- Writing production-ready code
- Changing api-contracts.artifact.json
- Introducing new patterns without justification
- Writing backend-specific logic

## Output
Produce a structured implementation plan containing:
- affected_files
- execution_flow
- dependency_notes
- risk_points

## Artifacts
- .agent/artifacts/plans.artifact.json
