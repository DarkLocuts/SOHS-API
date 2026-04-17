---
name: backend_analyze_static_bug
description: Parses the output of static analysis tools and returns structured error reports.
---

# Backend Analyze Static Errors

## Goal
Read the output from static analysis runners backend and produce a structured JSON that lists:
- file paths
- error types
- error messages

## Instructions
1. Parse the static analysis output text.
2. Identify filenames, line numbers, and error messages.
3. Output a well-formed JSON with the following keys:
   - layer: "backend"
   - issues: array of {path, line, message}

## Constraints
- Do not modify any source code.
- Only read the outputs and produce a structured report.
- This project DOES NOT use ESLint or any linting tool.
- Static analysis is limited to:
  - TypeScript compiler check (tsc --noEmit)
- Dont use linting tools:
  - The agent MUST NOT run lint
  - The agent MUST NOT run eslint
  - The agent MUST NOT suggest installing lint tools
  - The agent MUST NOT modify configuration to enable linting

## Output
Produce a structured report following bugs schema containing:
- error_type
- probable_causes (with confidence)

## Artifacts
- .agent/artifacts/bugs.artifact.json