---
name: backend_code_review
description: Code review and structural alignment skill for Elysia-Light backend projects
---

# Backend Code Review

## GOAL

* Detect files, folders, and code patterns that violate Elysia-Light conventions
* Normalize structure and naming to match documented Elysia-Light patterns
* Ensure components, hooks, and logic are placed correctly


## INPUTS

* Backend source code under `./`
* Elysia-Light concept documentation on Elysia Light Reference
* Elysia-Light pattern documentation on Elysia Light Reference


## ALLOWED ACTIONS

* Read all backend files
* Move files or folders to correct locations
* Rename files to match pattern conventions
* Split files when they violate size or responsibility rules
* Refactor code to follow documented Elysia-Light patterns


## FORBIDDEN ACTIONS

* Changing feature behavior
* Adding new features or API Endpoints
* Introducing new architectural patterns not documented in Elysia-Light


## REVIEW CHECKLIST

The agent MUST analyze:

### 1. Folder Structure

* Follow the elysia light folder structure rules
* Controller and model are wrapped in module folder
* Put the service folder into the module in the controller and model

### 2. File Naming

* File names are descriptive and consistent
* No ambiguous names such as `index.tsx` without context
* Prefixing or grouping is used when scale increases

### 3. Service Responsibility

* One service = one clear responsibility
* Use service object pattern

### 4. Pattern Compliance

* Follow the Elysia-Light patterns
* There cannot be n+1 queries


## DEFINITION OF DONE

This skill is complete when:

* All structural violations are resolved OR explicitly reported
* No behavior changes are introduced
* Codebase matches Elysia-Light patterns consistently


## ENFORCEMENT STATEMENT

This skill is binding for:

* AI code reviewers
* automated refactor agents
* human reviewers

Any refactor outside these rules is INVALID.
