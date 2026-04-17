# SOHS Backend API Development Specification

> **Stock Opname Handling System — Backend API Contracts & Data Structures**
> Derived from frontend pages analysis on 2026-04-13

---

## Table of Contents

1. [Overview](#1-overview)
2. [General Conventions](#2-general-conventions)
3. [Database Schema](#3-database-schema)
4. [Role-Based Access Control](#4-role-based-access-control)
5. [API Contracts by Module](#5-api-contracts-by-module)
   - [5.1 Authentication](#51-authentication)
   - [5.2 Dashboard](#52-dashboard)
   - [5.3 Products (Inventory)](#53-products-inventory)
   - [5.4 Opname Sessions](#54-opname-sessions)
   - [5.5 Opname Process (QR Scanning)](#55-opname-process-qr-scanning)
   - [5.6 Locations](#56-locations)
   - [5.7 Categories](#57-categories)
   - [5.8 Brands](#58-brands)
   - [5.9 Users](#59-users)
   - [5.10 Synchronization (Import)](#510-synchronization-import)
   - [5.11 Print QR Code](#511-print-qr-code)
   - [5.12 Profile & Account](#512-profile--account)

---

## 1. Overview

SOHS is a QR Code-based Stock Opname (physical inventory count) system. The frontend is built with Next.js and communicates via REST API. This document defines every API endpoint the backend must implement, along with database schema and business rules.

### Frontend Pages → API Mapping

| Frontend Page | Route | APIs Consumed |
|---|---|---|
| Login | `/login` | `POST /api/login` |
| Root Redirect | `/` | Auth token check (client-side) |
| Dashboard | `/dashboard` | `GET /api/dashboard/summary`, `GET /api/stock-variance`, `GET /api/opnames` |
| Inventory | `/inventories` | `GET /api/products`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id` |
| Opname List | `/opname` | `GET /api/opnames` |
| Opname Detail | `/opname/:id` | `GET /api/opnames/:id` |
| Print QR | `/print-qr` | `GET /api/products`, `GET /api/locations`, `POST /api/print-qr/generate` |
| Sync SKU & Stock | `/sync` | `POST /api/products/sync` |
| Settings | `/settings` | Profile display (uses auth context) |
| Locations | `/settings/locations` | `GET /api/locations`, `POST /api/locations`, `PUT /api/locations/:id`, `DELETE /api/locations/:id` |
| Categories | `/settings/categories` | `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id` |
| Brands | `/settings/brands` | `GET /api/brands`, `POST /api/brands`, `PUT /api/brands/:id`, `DELETE /api/brands/:id` |
| Users | `/settings/users` | `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id` |

---

## 2. General Conventions

### 2.1 Base URL

```
{BASE_URL}/api
```

### 2.2 Authentication Header

All endpoints (except `POST /api/login`) require:

```
Authorization: Bearer {access_token}
```

### 2.3 Standard Success Response

```jsonc
{
  "status": 200,
  "message": "Success",
  "data": { /* resource or array */ },
  "total": 10  // only for list endpoints
}
```

### 2.4 Standard Error Responses

```jsonc
// 422 Validation Error
{
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}

// 401 Unauthorized
{
  "message": "Unauthenticated"
}

// 403 Forbidden
{
  "message": "Forbidden"
}

// 404 Not Found
{
  "message": "Resource not found"
}

// 500 Internal Server Error
{
  "message": "Internal Server Error"
}
```

### 2.5 Pagination (List Endpoints)

All list endpoints (`GET`) support:

| Query Param | Type | Default | Description |
|---|---|---|---|
| `page` | int | `1` | Current page number |
| `per_page` | int | `15` | Items per page |
| `sort_by` | string | `created_at` | Column to sort by |
| `sort_dir` | string | `desc` | Sort direction: `asc` or `desc` |
| `search` | string | `""` | Global search keyword |

Paginated response format:

```jsonc
{
  "status": 200,
  "message": "Success",
  "data": [ /* items */ ],
  "total": 100,
  "page": 1,
  "per_page": 15,
  "last_page": 7
}
```

---

## 3. Database Schema

### 3.1 `users`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(200) | NOT NULL | Nama lengkap |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL | Login username |
| `password` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `role` | ENUM | NOT NULL | `admin`, `warehouse_supervisor`, `staff_gudang`, `operator_scanner` |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

### 3.2 `products`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `sku` | VARCHAR(50) | UNIQUE, NOT NULL | SKU code (e.g. `KP01-BTL-01`) |
| `name` | VARCHAR(200) | NOT NULL | Nama barang |
| `warehouse` | VARCHAR(100) | NOT NULL | Nama gudang/lokasi |
| `stock` | INT | DEFAULT 0 | Stok sistem saat ini |
| `category_id` | BIGINT | FK → categories.id, NULLABLE | |
| `brand_id` | BIGINT | FK → brands.id, NULLABLE | |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

### 3.3 `locations`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(200) | NOT NULL | Nama lokasi (e.g. `Central Jakarta WH-01`) |
| `zone` | VARCHAR(100) | NOT NULL | Zona/area (e.g. `Rack A-12`) |
| `code` | VARCHAR(50) | UNIQUE, NOT NULL | Kode lokasi (e.g. `CJK-WH01`) |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

### 3.4 `categories`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(200) | UNIQUE, NOT NULL | Nama jenis barang |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

> **Computed field**: `skuCount` — jumlah produk yang memiliki `category_id` ini.

### 3.5 `brands`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(200) | UNIQUE, NOT NULL | Nama brand |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

> **Computed field**: `productCount` — jumlah produk yang memiliki `brand_id` ini.

### 3.6 `opnames`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `title` | VARCHAR(200) | NOT NULL | Judul sesi opname |
| `date_start` | DATE | NOT NULL | Tanggal mulai |
| `date_end` | DATE | NULLABLE | Tanggal selesai (null = masih berlangsung) |
| `status` | ENUM | NOT NULL | `Proses`, `Selesai`, `Dibatalkan` |
| `location_id` | BIGINT | FK → locations.id, NULLABLE | Lokasi target opname |
| `created_by` | BIGINT | FK → users.id | User yang membuat sesi |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

> **Computed field**: `selisih` — total selisih (physical_stock - system_stock) dari semua `opname_items`. `null` jika status bukan `Selesai`.

### 3.7 `opname_items`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `opname_id` | BIGINT | FK → opnames.id, NOT NULL | |
| `product_id` | BIGINT | FK → products.id, NOT NULL | |
| `sku` | VARCHAR(50) | NOT NULL | Snapshot SKU |
| `name` | VARCHAR(200) | NOT NULL | Snapshot nama produk |
| `system_stock` | INT | NOT NULL | Stok sistem saat opname dimulai |
| `physical_stock` | INT | DEFAULT 0 | Stok hasil hitung fisik |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

### 3.8 `qr_labels`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `entity_type` | ENUM | NOT NULL | `product` atau `location` |
| `entity_id` | BIGINT | NOT NULL | FK ke products.id atau locations.id |
| `serial_number` | VARCHAR(100) | UNIQUE, NOT NULL | Serial QR (e.g. `KP01-043`) |
| `sequence` | INT | NOT NULL | Nomor urut label untuk entity ini |
| `created_at` | TIMESTAMP | | |

### 3.9 `sync_logs`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `file_name` | VARCHAR(255) | NOT NULL | Nama file yang di-upload |
| `file_size` | BIGINT | NOT NULL | Ukuran file (bytes) |
| `total_rows` | INT | | Jumlah baris yang diproses |
| `new_skus` | INT | DEFAULT 0 | SKU baru yang ditambahkan |
| `updated_skus` | INT | DEFAULT 0 | SKU yang di-update |
| `errors` | INT | DEFAULT 0 | Baris yang gagal |
| `status` | ENUM | NOT NULL | `processing`, `success`, `failed` |
| `uploaded_by` | BIGINT | FK → users.id | |
| `created_at` | TIMESTAMP | | |

---

## 4. Role-Based Access Control

| Role | Code | Permission |
|---|---|---|
| **Admin** | `admin` | Full access: semua fitur + manajemen pengguna |
| **Warehouse Supervisor** | `warehouse_supervisor` | Dashboard, Opname (create/view/complete), Inventory (view/edit), Settings (locations/categories/brands), Sync |
| **Staff Gudang** | `staff_gudang` | View dashboard, Process scan, View inventory, View opname detail |
| **Operator Scanner** | `operator_scanner` | Hanya akses proses scan opname |

### Permission Matrix

| Endpoint Group | Admin | W. Supervisor | Staff Gudang | Operator Scanner |
|---|---|---|---|---|
| Auth (login/profile) | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ❌ |
| Products CRUD | ✅ | ✅ | 🔍 Read | ❌ |
| Opname Create/Edit | ✅ | ✅ | ❌ | ❌ |
| Opname View | ✅ | ✅ | ✅ | ✅ |
| Process (Scan) | ✅ | ✅ | ✅ | ✅ |
| Locations CRUD | ✅ | ✅ | ❌ | ❌ |
| Categories CRUD | ✅ | ✅ | ❌ | ❌ |
| Brands CRUD | ✅ | ✅ | ❌ | ❌ |
| Users CRUD | ✅ | ❌ | ❌ | ❌ |
| Sync Upload | ✅ | ✅ | ❌ | ❌ |
| Print QR | ✅ | ✅ | ✅ | ❌ |

---

## 5. API Contracts by Module

---

### 5.1 Authentication

#### `POST /api/login`

> **Auth**: Not required
> **Content-Type**: `multipart/form-data` (used by FormSupervisionComponent)

**Request Body (form-data)**:

| Field | Type | Validation | Description |
|---|---|---|---|
| `username` | string | required | Username |
| `password` | string | required | Password |

**Response 200 (Success)**:

```json
{
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "Administrator",
      "username": "admin",
      "role": "admin"
    }
  }
}
```

**Response 422 (Failed)**:

```json
{
  "message": "Username atau password salah",
  "errors": {
    "username": ["Username atau password tidak valid"]
  }
}
```

> **Business Logic**:
> - Validate credentials against bcrypt-hashed password
> - Generate JWT token with user ID, role claims
> - Token expiry: configurable (default 7 days)

---

#### `POST /api/logout`

> **Auth**: Required

**Response 200**:

```json
{
  "message": "Logged out successfully"
}
```

> **Business Logic**: Invalidate/blacklist token

---

#### `GET /api/me`

> **Auth**: Required

**Response 200**:

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    "username": "budisantoso",
    "role": "warehouse_supervisor"
  }
}
```

> **Notes**: Used by `AuthContext` to fetch current user profile on app init (see `fetchUser` in Auth.context.tsx).

---

### 5.2 Dashboard

#### `GET /api/dashboard/summary`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor, Staff Gudang

**Response 200**:

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "total_sku": 150,
    "total_stock": 1200
  }
}
```

> **Business Logic**:
> - `total_sku`: `COUNT(DISTINCT sku)` dari tabel `products`
> - `total_stock`: `SUM(stock)` dari tabel `products`

---

#### `GET /api/dashboard/stock-variance`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor, Staff Gudang

**Query Params**:

| Param | Type | Default | Description |
|---|---|---|---|
| `year` | int | current year | Tahun filter |

**Response 200**:

```json
{
  "status": 200,
  "message": "Success",
  "data": [
    { "month": "Jan", "value": -10 },
    { "month": "Feb", "value": 5 },
    { "month": "Mar", "value": -15 },
    { "month": "Apr", "value": 0 },
    { "month": "Mei", "value": 2 },
    { "month": "Jun", "value": -8 },
    { "month": "Jul", "value": 5 },
    { "month": "Agu", "value": -12 },
    { "month": "Sep", "value": 10 },
    { "month": "Okt", "value": -5 },
    { "month": "Nov", "value": 15 },
    { "month": "Des", "value": -20 }
  ]
}
```

> **Business Logic**: Aggregate `SUM(physical_stock - system_stock)` per month dari `opname_items` di sesi opname yang `status = 'Selesai'`.

---

#### `GET /api/dashboard/recent-opnames`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor, Staff Gudang

**Query Params**:

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | int | `3` | Jumlah opname terakhir |

**Response 200**:

```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "date_start": "30/09/2023",
      "date_end": "01/10/2023",
      "status": "Selesai",
      "selisih": -15
    },
    {
      "id": 3,
      "date_start": "25/09/2023",
      "date_end": "26/09/2023",
      "status": "Selesai",
      "selisih": 0
    },
    {
      "id": 2,
      "date_start": "20/09/2023",
      "date_end": null,
      "status": "Proses",
      "selisih": null
    }
  ]
}
```

---

### 5.3 Products (Inventory)

#### `GET /api/products`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor, Staff Gudang (read-only)
> **Used by**: Inventory page, Print QR page

**Query Params**: Standard pagination + sorting + search (see §2.5)

Searchable fields: `sku`, `name`, `warehouse`

**Response 200**:

```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "sku": "KP01-BTL-01",
      "name": "KOPI HITAM ARABIKA 250G",
      "warehouse": "WAREHOUSE A",
      "stock": 124,
      "category_id": 1,
      "brand_id": 1
    }
  ],
  "total": 150,
  "page": 1,
  "per_page": 15,
  "last_page": 10
}
```

---

#### `POST /api/products`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor
> **Content-Type**: `multipart/form-data`

**Request Body (form-data)**:

| Field | Type | Validation | Description |
|---|---|---|---|
| `sku` | string | required, unique | Kode SKU |
| `name` | string | required, max:200 | Nama barang |
| `warehouse` | string | required | Nama gudang |
| `stock` | integer | required, min:0 | Stok awal |

**Response 200**:

```json
{
  "status": 200,
  "message": "Produk berhasil ditambahkan",
  "data": {
    "id": 6,
    "sku": "NEW-SKU-01",
    "name": "Produk Baru",
    "warehouse": "WAREHOUSE A",
    "stock": 100
  }
}
```

---

#### `PUT /api/products/:id`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor
> **Content-Type**: `multipart/form-data`

**Request Body**: Same as POST

**Response 200**:

```json
{
  "status": 200,
  "message": "Produk berhasil diperbarui",
  "data": { /* updated product */ }
}
```

---

#### `DELETE /api/products/:id`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor

**Response 200**:

```json
{
  "status": 200,
  "message": "Produk berhasil dihapus"
}
```

---

#### `DELETE /api/products` (Bulk Delete)

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor

**Request Body**:

```json
{
  "ids": [1, 2, 3]
}
```

**Response 200**:

```json
{
  "status": 200,
  "message": "3 produk berhasil dihapus"
}
```

> **Note**: Frontend `controlBar` includes `SELECTABLE`, implying bulk operations.

---

### 5.4 Opname Sessions

#### `GET /api/opnames/list`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor, Staff Gudang

**Query Params**: Standard pagination + sorting + search (see §2.5)

Sortable fields: `date_start`, `date_end`, `status`
Searchable fields: `title`, `status`

**Response 200**:

```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "date_start": "30/09/2023",
      "date_end": "01/10/2023",
      "status": "Selesai",
      "selisih": -15
    },
    {
      "id": 2,
      "date_start": "05/10/2023",
      "date_end": null,
      "status": "Proses",
      "selisih": null
    }
  ],
  "total": 5,
  "page": 1,
  "per_page": 15,
  "last_page": 1
}
```

> **Business Logic**:
> - `selisih` = `SUM(physical_stock - system_stock)` dari `opname_items` WHERE `opname_id = id`
> - `selisih` = `null` jika status bukan `Selesai`
> - `date_start` format: `DD/MM/YYYY`

---

#### `GET /api/opnames/:id`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor, Staff Gudang, Operator Scanner

**Response 200**:

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "title": "Opname September Akhir",
    "date": "30 Sep 2023",
    "status": "Selesai",
    "total_items": 8,
    "location": {
      "id": 1,
      "name": "Gudang Belakang"
    },
    "items": [
      {
        "id": 1,
        "sku": "KP01-BTL-01",
        "name": "KOPI HITAM",
        "system_stock": 150,
        "physical_stock": 146
      },
      {
        "id": 2,
        "sku": "TH02-BTL-01",
        "name": "TEH BOTOL 450ML",
        "system_stock": 200,
        "physical_stock": 200
      }
    ]
  }
}
```

---

#### `POST /api/opnames`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor

**Request Body**:

```json
{
  "title": "Opname November 2023",
  "location_id": 1
}
```

**Response 200**:

```json
{
  "status": 200,
  "message": "Sesi opname berhasil dibuat",
  "data": {
    "id": 6,
    "title": "Opname November 2023",
    "date_start": "13/04/2026",
    "date_end": null,
    "status": "Proses",
    "location": {
      "id": 1,
      "name": "Central Jakarta WH-01"
    }
  }
}
```

> **Business Logic**:
> - Auto-populate `opname_items` with all products (snapshot `system_stock`)
> - Set `status = 'Proses'`, `date_start = now()`
> - Set `created_by` from auth user

---

#### `PUT /api/opnames/:id/complete`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor

**Response 200**:

```json
{
  "status": 200,
  "message": "Opname selesai",
  "data": {
    "id": 1,
    "status": "Selesai",
    "date_end": "14/04/2026",
    "selisih": -15
  }
}
```

> **Business Logic**:
> - Set `status = 'Selesai'`, `date_end = now()`
> - Calculate final `selisih`

---

#### `PUT /api/opnames/:id/cancel`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor

**Response 200**:

```json
{
  "status": 200,
  "message": "Opname dibatalkan",
  "data": {
    "id": 4,
    "status": "Dibatalkan"
  }
}
```

---

### 5.5 Opname Process (QR Scanning)

#### `POST /api/opnames/:id/scan`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor, Staff Gudang, Operator Scanner

**Request Body**:

```json
{
  "serial_number": "KP01-043"
}
```

**Response 200 (Product Found)**:

```json
{
  "status": 200,
  "message": "Scan berhasil",
  "data": {
    "serial_number": "KP01-043",
    "product": {
      "name": "KOPI HITAM",
      "sku": "KP01-BTL-01"
    },
    "opname_item": {
      "id": 1,
      "physical_stock": 4,
      "system_stock": 150
    }
  }
}
```

> **Business Logic**:
> - Lookup `serial_number` in `qr_labels` → resolve `entity_type = 'product'` → get `product_id`
> - Find matching `opname_item` by `opname_id` + `product_id`
> - Increment `physical_stock` by 1
> - Return updated counts
> - If serial not found: return 404 with `"QR code tidak dikenali"`
> - Prevent scan if opname status ≠ `Proses`

**Response 404 (Not Found)**:

```json
{
  "status": 404,
  "message": "QR code tidak dikenali",
  "data": {
    "serial_number": "UNKNOWN-CODE"
  }
}
```

---

#### `GET /api/opnames/:id/scan-summary`

> **Auth**: Required
> **Used by**: Process page to show scan progress

**Response 200**:

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "opname_id": 2,
    "title": "Opname Oktober",
    "location": "Gudang Belakang",
    "date": "24 Oct 2023",
    "scanned_items": [
      {
        "sku": "KP01-BTL-01",
        "name": "KOPI HITAM",
        "physical_stock": 3,
        "system_stock": 150,
        "last_scan_at": "2023-10-24T14:32:10Z"
      }
    ]
  }
}
```

---

### 5.6 Locations

#### `GET /api/locations`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor

**Query Params**: Standard pagination + sorting + search

Searchable fields: `name`, `zone`, `code`

**Response 200**:

```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Central Jakarta WH-01",
      "zone": "Rack A-12",
      "code": "CJK-WH01"
    }
  ],
  "total": 5,
  "page": 1,
  "per_page": 15,
  "last_page": 1
}
```

---

#### `POST /api/locations`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor
> **Content-Type**: `multipart/form-data`

**Request Body (form-data)**:

| Field | Type | Validation | Description |
|---|---|---|---|
| `name` | string | required, max:200 | Warehouse name |
| `code` | string | required, max:100, unique | Kode lokasi |
| `zone` | string | required | Description / zona |

**Response 200**:

```json
{
  "status": 200,
  "message": "Lokasi berhasil ditambahkan",
  "data": {
    "id": 6,
    "name": "New Warehouse",
    "zone": "Section A",
    "code": "NW-01"
  }
}
```

---

#### `PUT /api/locations/:id`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor
> **Content-Type**: `multipart/form-data`

**Request Body**: Same as POST

---

#### `DELETE /api/locations/:id`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor

#### `DELETE /api/locations` (Bulk)

**Request Body**: `{ "ids": [1, 2] }`

---

### 5.7 Categories

#### `GET /api/categories`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor

**Response 200**:

```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Beverages",
      "skuCount": 245
    }
  ],
  "total": 5
}
```

> **Note**: `skuCount` is computed: `COUNT(products WHERE category_id = this.id)`

---

#### `POST /api/categories`

> **Content-Type**: `multipart/form-data`

| Field | Type | Validation | Description |
|---|---|---|---|
| `name` | string | required, max:200, unique | Nama jenis barang |

---

#### `PUT /api/categories/:id`

**Request Body**: Same as POST

---

#### `DELETE /api/categories/:id`

#### `DELETE /api/categories` (Bulk)

**Request Body**: `{ "ids": [1, 2] }`

> **Business Logic**: Cannot delete if category has associated products. Return 422 with `"Kategori masih memiliki produk terdaftar"`.

---

### 5.8 Brands

#### `GET /api/brands`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor

**Response 200**:

```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Java Prime",
      "productCount": 142
    }
  ],
  "total": 5
}
```

> **Note**: `productCount` is computed: `COUNT(products WHERE brand_id = this.id)`

---

#### `POST /api/brands`

> **Content-Type**: `multipart/form-data`

| Field | Type | Validation | Description |
|---|---|---|---|
| `name` | string | required, max:200, unique | Nama brand |

---

#### `PUT /api/brands/:id`

**Request Body**: Same as POST

---

#### `DELETE /api/brands/:id`

#### `DELETE /api/brands` (Bulk)

**Request Body**: `{ "ids": [1, 2] }`

> **Business Logic**: Cannot delete if brand has associated products. Return 422 with `"Brand masih memiliki produk terdaftar"`.

---

### 5.9 Users

#### `GET /api/users`

> **Auth**: Required
> **Roles**: Admin only

**Response 200**:

```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "username": "budisantoso",
      "role": "warehouse_supervisor"
    }
  ],
  "total": 5
}
```

---

#### `POST /api/users`

> **Auth**: Required
> **Roles**: Admin only
> **Content-Type**: `multipart/form-data`

| Field | Type | Validation | Description |
|---|---|---|---|
| `name` | string | required, max:200 | Nama lengkap |
| `username` | string | required, max:100, unique | Username |
| `role` | string | required, in:[`admin`, `warehouse_supervisor`, `staff_gudang`, `operator_scanner`] | Role |
| `password` | string | required, min:6 | Password (hashed before save) |

---

#### `PUT /api/users/:id`

> **Auth**: Required
> **Roles**: Admin only
> **Content-Type**: `multipart/form-data`

| Field | Type | Validation | Description |
|---|---|---|---|
| `name` | string | required, max:200 | |
| `username` | string | required, max:100, unique (except self) | |
| `role` | string | required | |
| `password` | string | optional, min:6 | Jika kosong, password tidak diubah |

---

#### `DELETE /api/users/:id`

> **Auth**: Required
> **Roles**: Admin only

> **Business Logic**: Cannot delete self. Return 422 with `"Tidak dapat menghapus akun sendiri"`.

#### `DELETE /api/users` (Bulk)

**Request Body**: `{ "ids": [2, 3] }`

---

### 5.10 Synchronization (Import)

#### `POST /api/sync/upload`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor
> **Content-Type**: `multipart/form-data`

**Request Body (form-data)**:

| Field | Type | Validation | Description |
|---|---|---|---|
| `file` | File | required, mimes:xlsx,csv, max:10240 (10MB) | File sync |

**Response 200**:

```json
{
  "status": 200,
  "message": "Data berhasil disinkronkan",
  "data": {
    "sync_id": 1,
    "file_name": "stock_update_oct2023.xlsx",
    "total_rows": 150,
    "new_skus": 12,
    "updated_skus": 138,
    "errors": 0,
    "status": "success"
  }
}
```

**Response 422 (Validation Error)**:

```json
{
  "message": "File tidak valid",
  "errors": {
    "file": ["Format file harus .xlsx atau .csv"],
    "rows": [
      { "row": 5, "error": "SKU kosong" },
      { "row": 12, "error": "Stok bukan angka valid" }
    ]
  }
}
```

> **Business Logic**:
> - Parse uploaded file (xlsx/csv)
> - Expected columns: `SKU`, `Stok` (at minimum), optionally `name`, `warehouse`
> - For each row:
>   - If SKU exists → update `stock`
>   - If SKU not exists → create new product
> - Log to `sync_logs` table
> - Return summary

---

#### `GET /api/sync/logs`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor

**Response 200**:

```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "file_name": "stock_update.xlsx",
      "total_rows": 150,
      "new_skus": 12,
      "updated_skus": 138,
      "errors": 0,
      "status": "success",
      "created_at": "2023-10-24T10:30:00Z"
    }
  ]
}
```

---

### 5.11 Print QR Code

#### `POST /api/print-qr/generate`

> **Auth**: Required
> **Roles**: Admin, Warehouse Supervisor, Staff Gudang

**Request Body**:

```json
{
  "items": [
    { "entity_type": "product", "entity_id": 1 },
    { "entity_type": "product", "entity_id": 3 },
    { "entity_type": "location", "entity_id": 2 }
  ]
}
```

**Response 200**:

```json
{
  "status": 200,
  "message": "QR labels generated",
  "data": {
    "labels": [
      {
        "entity_type": "product",
        "entity_id": 1,
        "name": "KOPI HITAM ARABIKA 250G",
        "sku": "KP01-BTL-01",
        "serial_number": "KP01-046",
        "sequence": 46,
        "qr_data": "KP01-046"
      },
      {
        "entity_type": "location",
        "entity_id": 2,
        "name": "Surabaya Logistics Hub",
        "code": "SBY-LH01",
        "serial_number": "SBY-LH01-001",
        "sequence": 1,
        "qr_data": "SBY-LH01-001"
      }
    ],
    "print_url": "/api/print-qr/pdf/abc123"
  }
}
```

> **Business Logic**:
> - For each item, generate a new `qr_labels` entry with incremented sequence
> - The `serial_number` is the value encoded in the QR
> - Optionally generate a PDF with printable QR label layout

---

#### `GET /api/print-qr/pdf/:batch_id`

> **Auth**: Required
> Returns: PDF file (binary) with printable QR labels

---

### 5.12 Profile & Account

#### `PUT /api/profile`

> **Auth**: Required
> **Roles**: All

**Request Body**:

```json
{
  "name": "Budi Santoso Updated"
}
```

**Response 200**:

```json
{
  "status": 200,
  "message": "Profil berhasil diperbarui",
  "data": {
    "id": 1,
    "name": "Budi Santoso Updated",
    "username": "budisantoso",
    "role": "warehouse_supervisor"
  }
}
```

---

#### `PUT /api/profile/password`

> **Auth**: Required
> **Roles**: All

**Request Body**:

```json
{
  "old_password": "currentPass123",
  "new_password": "newStrongPass456",
  "new_password_confirmation": "newStrongPass456"
}
```

**Response 200**:

```json
{
  "status": 200,
  "message": "Password berhasil diubah"
}
```

**Response 422**:

```json
{
  "message": "Validation failed",
  "errors": {
    "old_password": ["Password lama tidak sesuai"],
    "new_password": ["Password minimal 6 karakter"],
    "new_password_confirmation": ["Konfirmasi password tidak sesuai"]
  }
}
```

---

## Appendix A: Data Types Summary

| Entity | Key Fields | Notes |
|---|---|---|
| **User** | id, name, username, password(hash), role | Role-based enum |
| **Product** | id, sku(unique), name, warehouse, stock, category_id, brand_id | Stock updated via sync & opname |
| **Location** | id, name, zone, code(unique) | Physical warehouse locations |
| **Category** | id, name | + computed `skuCount` |
| **Brand** | id, name | + computed `productCount` |
| **Opname** | id, title, date_start, date_end, status, location_id, created_by | Status enum: Proses/Selesai/Dibatalkan |
| **OpnameItem** | id, opname_id, product_id, sku, name, system_stock, physical_stock | Snapshot data at opname creation |
| **QrLabel** | id, entity_type, entity_id, serial_number(unique), sequence | Maps QR serial → product/location |
| **SyncLog** | id, file_name, total_rows, new_skus, updated_skus, errors, status, uploaded_by | Audit trail for imports |

---

## Appendix B: Recommended Tech Stack

| Component | Recommendation |
|---|---|
| **Runtime** | Node.js / Bun |
| **Framework** | Express.js / Hono / Fastify |
| **ORM** | Prisma / Drizzle / TypeORM |
| **Database** | PostgreSQL / MySQL |
| **Auth** | JWT (jsonwebtoken / jose) |
| **File Parsing** | xlsx (SheetJS) for .xlsx, csv-parse for .csv |
| **QR Generation** | qrcode (npm package) |
| **PDF Generation** | puppeteer / pdfkit |
| **Validation** | zod / joi / class-validator |
| **Password Hashing** | bcrypt / argon2 |

---

## Appendix C: Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sohs
DB_USER=postgres
DB_PASSWORD=secret

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d

# Server
PORT=3001
NODE_ENV=development

# File Upload
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./uploads
```
