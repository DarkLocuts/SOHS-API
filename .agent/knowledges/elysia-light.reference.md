# Elysia-Light References

This document contains **authoritative references**
for understanding Elysia-Light concepts, patterns, and utilities.

These references are intended for:

* Design System interpretation
* Planning and decision making
* Clarification when ambiguity exists

This document MUST NOT be used to justify deviations
from the Architecture Rules or Patterns.

---

## Intro

### Apa Itu Elysia-Light?

Path:

```
/
```

Description:

* High-level overview of Elysia-Light
* Framework goals
* Design philosophy

---

### Konsep Dasar

Path:

```
/concept
```

Description:

* Mental model of Elysia-Light
* Request–response lifecycle
* Modular backend philosophy

---

### Struktur & Pattern

Path:

```
/pattern
```

Description:

* Folder structure
* Architectural patterns
* Responsibility boundaries

This document acts as the **architecture contract**.

---

## Technical

### API Service

Path:

```
/technical/api
```

Purpose:

* API layering
* Route grouping
* Versioning strategy

---

### Middleware

Path:

```
/technical/middleware
```

Purpose:

* Request interception
* Auth & validation flow
* Cross-cutting concerns

---

### Database (Knex JS)

Path:

```
/technical/db
```

Purpose:

* Database connection
* Query abstraction
* Transaction handling

---

### Data Analytic (Clickhouse)

Path:

```
/technical/da
```

Purpose:

* OLAP data handling
* Event-based analytics
* High-volume query patterns

---

### Cron

Path:

```
/technical/cron
```

Purpose:

* Scheduled jobs
* Background execution
* Time-based automation

---

### Queue

Path:

```
/technical/queue
```

Purpose:

* Async task handling
* Job distribution
* Worker architecture

---

### Socket

Path:

```
/technical/socket
```

Purpose:

* Realtime communication
* Event broadcasting
* Connection lifecycle

---

### Email

Path:

```
/technical/email
```

Purpose:

* Email service abstraction
* Template handling
* Delivery strategies

---

### Storage

Path:

```
/technical/storage
```

Purpose:

* File storage handling
* Local and remote storage
* Access control

---

## Utilities

### Controller

Path:

```
/utility/controller
```

Purpose:

* Controller abstraction
* Request mapping
* Response normalization

---

### Validation

Path:

```
/utility/validation
```

Purpose:

* Input validation
* Schema definition
* Error shaping

---

### Auth

Path:

```
/utility/auth
```

Purpose:

* Authentication utilities
* Token handling
* Session strategy

---

### Permission (RBAC)

Path:

```
/utility/permission
```

Purpose:

* Role-based access control
* Permission resolution
* Policy enforcement

---

### ORM

Path:

```
/utility/orm
```

Purpose:

* Model abstraction
* Relationship handling
* Data mapping

---

### OLAP Query Builder

Path:

```
/utility/da
```

Purpose:

* Analytical query builder
* Metric aggregation
* Dimension handling

---

### Caching (Redis)

Path:

```
/utility/caching
```

Purpose:

* Cache abstraction
* TTL strategy
* Invalidation rules

---

### Converting

Path:

```
/utility/converting
```

Purpose:

* Data transformation
* Type normalization
* Format helpers

---

### Encrypting

Path:

```
/utility/encrypting
```

Purpose:

* Encryption utilities
* Hashing helpers
* Secure data handling

---

## CLI

### Generator

Path:

```
/cli/generator
```

Purpose:

* Code scaffolding
* Boilerplate generation
* Consistency enforcement

---

### Migration & Seeder

Path:

```
/cli/migration-seeder
```

Purpose:

* Database migration
* Seeder management
* Version control

---

### Blueprint

Path:

```
/cli/blueprint
```

Purpose:

* Feature blueprinting
* Structural standardization

---

### Barrel

Path:

```
/cli/barrel
```

Purpose:

* Export aggregation
* Import management

---

## Internal References

* Existing backend modules
* Shared utilities
* Proven Elysia-Light implementation patterns
