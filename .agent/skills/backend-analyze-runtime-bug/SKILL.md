---
name: backend_analyze_runtime_bug
description: Analyze backend runtime failures using browser-based observation.
---

# Backend Analyze Runtime Bug

## Goal
Determine the root cause of backend runtime errors by executing feature-scoped API tests and inspecting runtime logs.
The agent MUST prefer automated tests in `/test` as the primary debugging instrument.

## Allowed Tools
- Run backend test commands
- Call API endpoints (HTTP)
- Read server logs
- Read backend source files (API layer only)
- Create test files inside `/test`

## Required Test Structure

### Rules
- Each **feature** MUST have its own test file
- One test file == one API domain / feature
- Test files MUST be readable, explicit, and reproducible
- Tests are used both to **reproduce** and **verify** the fix

## Steps
1. Identify the failing feature and target API endpoint.
2. Check `/test`:
   - If a relevant test file exists, use it.
   - If it does NOT exist, create a new test file for that feature.
3. In the test file:
   - Reproduce the failing API request
   - Assert expected vs actual behavior
4. Execute the test to capture:
   - HTTP status
   - Response payload
   - Error stack trace
5. Correlate failure output with:
   - API handler
   - Middleware
   - Validation or utility layer
6. Generate hypotheses for the failure.
7. Re-run tests to confirm consistency of the error.

## Scenario Coverage Rules

For each feature test file, the agent MUST attempt:
- at least 1 happy_path scenario
- at least 1 invalid_input scenario
- at least 1 authorization-related scenario (if applicable)
- at least 1 edge_case scenario
- at least 1 scenario that attempts to reproduce the reported runtime failure

If a scenario cannot be tested, the agent MUST state the reason explicitly in the report.

## Forbidden Actions
- Database migrations
- Data mutation or cleanup
- Editing frontend files
- Editing production backend logic
- Skipping test creation when `/test` is empty or incomplete

## Output
Produce a structured report following bugs schema containing:
- api_endpoint
- error_message
- stack_trace_location
- probable_causes (with confidence)

## Artifacts
- .agent/artifacts/bugs.artifact.json
