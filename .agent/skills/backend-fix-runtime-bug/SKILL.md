---
name: backend_fix_runtime_bug
description: Apply minimal runtime bug fixes in backend code.
---

# Backend Fix Runtime Bug

## Goal
Given an analysis of a backend runtime problem, apply minimal safe edits that resolve the issue.

## Rules    
- Only fix null guards, optional chaining, or basic backend logic mistakes.
- Do not refactor behavior or change design patterns.
- Follow Elysia-Light patterns and architecture rules.

## Forbidden Actions
- Modify logic or behavior.
- Make large refactors.
- Run commands outside the scope of static fixes.

## Output
- Patch file of changes.
- Explanation of edits and why they fix the runtime issue.
