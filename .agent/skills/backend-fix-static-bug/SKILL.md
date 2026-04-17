---
name: backend_fix_static_bug
description: Fix static analysis errors in backend code without changing logic.
---

# Backend Fix Static Bug

## Goal
Given a static error report for backend code, make minimal edits that resolve syntax or type errors without affecting application logic.

## Steps
1. Read the static error report.
2. Identify issues that are clearly syntax-level (e.g., missing import, typo).
3. Apply edits to the files to resolve those issues.
4. Produce a code diff that shows only allowed changes.

## Allowed Actions
- Edit code files under backend directory.
- Apply changes that only fix syntax or type errors.
- Follow Elysia-Light patterns and architecture rules.

## Forbidden Actions
- Modify logic or behavior.
- Make large refactors.
- Run commands outside the scope of static fixes.

## Output
- A unified patch file showing edits.
- A short explanation describing each edit and why it was necessary.

## Examples
Rewrite:
- `import x from "y"` if missing or mis-typed
Do not:
- change how component behavior works
