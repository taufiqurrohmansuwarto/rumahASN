# Hierarchical OPD Access Pattern

## 📖 Overview

Sistem menggunakan **hierarchical access pattern** dimana user dengan `organization_id` tertentu dapat mengakses data dari OPD mereka sendiri **DAN semua child OPD** di bawahnya.

Pattern ini menggunakan **SQL ILIKE** (PostgreSQL case-insensitive) dengan prefix matching: `skpd_id ILIKE '123%'`

---

## 🏢 OPD Hierarchy Structure

```
1                    ← Root/Admin (akses ke semua)
├── 12               ← Level 1
│   ├── 123          ← Level 2
│   │   ├── 1234     ← Level 3
│   │   │   ├── 12345    ← Level 4
│   │   │   └── 12346
│   │   ├── 1235
│   │   └── 1236
│   └── 124
└── 13
    ├── 131
    └── 132
```

---

## 🔐 Access Rules

### **Rule 1: Admin (organization_id = "1")**
- **Access:** Semua data dari semua OPD
- **SQL:** No filter applied
- **Example:**
  ```javascript
  User: { organization_id: "1", current_role: "admin" }
  → Can access: ALL data
  ```

### **Rule 2: OPD User (organization_id = "123")**
- **Access:** Data dari OPD "123" + semua children
- **SQL:** `WHERE skpd_id ILIKE '123%'`
- **Example:**
  ```javascript
  User: { organization_id: "123", current_role: "operator" }
  → Can access:
    - "123" (exact)
    - "1234", "1235", "1236" (children)
    - "12345", "12346" (grandchildren)
    - "123456", "123457", ... (great-grandchildren)
  
  → CANNOT access:
    - "12" (parent)
    - "124" (sibling)
    - "13" (uncle)
  ```

### **Rule 3: Deep OPD User (organization_id = "12345")**
- **Access:** Data dari OPD "12345" + semua children
- **SQL:** `WHERE skpd_id ILIKE '12345%'`
- **Example:**
  ```javascript
  User: { organization_id: "12345", current_role: "operator" }
  → Can access:
    - "12345" (exact)
    - "123456", "123457", ... (children)
  
  → CANNOT access:
    - "1234" (parent)
    - "12346" (sibling)
    - "123" (grandparent)
  ```

---

## 📊 SQL Examples

### **Example 1: Admin Query**
```sql
-- User: { organization_id: "1", current_role: "admin" }

SELECT * 
FROM siasn_proxy.proxy_pangkat
LEFT JOIN sync_pegawai ON proxy_pangkat.nip = sync_pegawai.nip_master
-- No WHERE clause for skpd_id (admin sees all)
ORDER BY tgl_usulan DESC;
```

### **Example 2: OPD "123" Query**
```sql
-- User: { organization_id: "123", current_role: "operator" }

SELECT * 
FROM siasn_proxy.proxy_pangkat
INNER JOIN sync_pegawai ON proxy_pangkat.nip = sync_pegawai.nip_master
WHERE sync_pegawai.skpd_id ILIKE '123%'  -- ← Hierarchical access (case-insensitive)
ORDER BY tgl_usulan DESC;

-- Matches:
-- ✓ skpd_id = "123"
-- ✓ skpd_id = "1234"
-- ✓ skpd_id = "12345"
-- ✓ skpd_id = "123456"
-- ✗ skpd_id = "12"
-- ✗ skpd_id = "124"
```

### **Example 3: OPD "123" with Filter NIP**
```sql
-- User: { organization_id: "123", current_role: "operator" }
-- Query: ?nip=1984

SELECT * 
FROM siasn_proxy.proxy_pangkat
INNER JOIN sync_pegawai ON proxy_pangkat.nip = sync_pegawai.nip_master
WHERE sync_pegawai.skpd_id ILIKE '123%'
  AND proxy_pangkat.nip ILIKE '%1984%'
ORDER BY tgl_usulan DESC;
```

---

## 🔧 API Usage

### **Endpoint: GET /api/siasn/ws/admin/proxy/pangkat**

#### **Request 1: Admin - See All**
```bash
GET /api/siasn/ws/admin/proxy/pangkat?page=1&limit=10
Authorization: Bearer <admin-token>

# User: { organization_id: "1", current_role: "admin" }
# Result: All data from all OPDs
```

#### **Request 2: Operator - See Own + Children**
```bash
GET /api/siasn/ws/admin/proxy/pangkat?page=1&limit=10
Authorization: Bearer <operator-token>

# User: { organization_id: "123", current_role: "operator" }
# Result: Data from "123", "1234", "12345", etc
```

#### **Request 3: Operator - Filter by NIP**
```bash
GET /api/siasn/ws/admin/proxy/pangkat?nip=1984
Authorization: Bearer <operator-token>

# User: { organization_id: "123", current_role: "operator" }
# Result: Data from "123%" with NIP containing "1984"
```

#### **Request 4: Operator - Filter by Periode**
```bash
GET /api/siasn/ws/admin/proxy/pangkat?periode=December 2025
Authorization: Bearer <operator-token>

# User: { organization_id: "123", current_role: "operator" }
# Result: Data from "123%" in December 2025
```

#### **Request 5: Admin - Filter by Specific OPD**
```bash
GET /api/siasn/ws/admin/proxy/pangkat?skpd_id=123
Authorization: Bearer <admin-token>

# User: { organization_id: "1", current_role: "admin" }
# Result: Data from "123%" only (admin can filter to specific OPD)
```

#### **Request 6: Download All Data (limit = -1)**
```bash
GET /api/siasn/ws/admin/proxy/pangkat?limit=-1
Authorization: Bearer <operator-token>

# User: { organization_id: "123", current_role: "operator" }
# Result: ALL data from "123%" without pagination (for download/export)
```

---

## 🎯 Testing Scenarios

### **Scenario 1: Hierarchical Access**
```javascript
// Setup
User A: { organization_id: "123", current_role: "operator" }

Database:
- PNS 1: { nip: "001", skpd_id: "123" }    ← ✓ Accessible
- PNS 2: { nip: "002", skpd_id: "1234" }   ← ✓ Accessible (child)
- PNS 3: { nip: "003", skpd_id: "12345" }  ← ✓ Accessible (grandchild)
- PNS 4: { nip: "004", skpd_id: "124" }    ← ✗ Not accessible (sibling)
- PNS 5: { nip: "005", skpd_id: "12" }     ← ✗ Not accessible (parent)

// Test
GET /api/siasn/ws/admin/proxy/pangkat
Authorization: Bearer <user-a-token>

// Expected Result
{
  "success": true,
  "data": [
    { "nip": "001", "pegawai": { "skpd_id": "123" } },    // ✓
    { "nip": "002", "pegawai": { "skpd_id": "1234" } },   // ✓
    { "nip": "003", "pegawai": { "skpd_id": "12345" } }   // ✓
    // PNS 4 and 5 are NOT included
  ]
}
```

### **Scenario 2: Deep Level Access**
```javascript
// Setup
User B: { organization_id: "12345", current_role: "operator" }

Database:
- PNS 1: { nip: "001", skpd_id: "12345" }   ← ✓ Accessible
- PNS 2: { nip: "002", skpd_id: "123456" }  ← ✓ Accessible (child)
- PNS 3: { nip: "003", skpd_id: "1234" }    ← ✗ Not accessible (parent)
- PNS 4: { nip: "004", skpd_id: "12346" }   ← ✗ Not accessible (sibling)

// Test
GET /api/siasn/ws/admin/proxy/pangkat
Authorization: Bearer <user-b-token>

// Expected Result
{
  "success": true,
  "data": [
    { "nip": "001", "pegawai": { "skpd_id": "12345" } },   // ✓
    { "nip": "002", "pegawai": { "skpd_id": "123456" } }   // ✓
    // PNS 3 and 4 are NOT included
  ]
}
```

---

## 🛠️ Helper Functions

### **isChildOpd(parentOpdId, childOpdId)**
Check if childOpdId is under parentOpdId hierarchy

```javascript
const { isChildOpd } = require("@/utils/siasn-proxy/helpers");

isChildOpd("123", "1234")   // → true  (child)
isChildOpd("123", "12345")  // → true  (grandchild)
isChildOpd("123", "124")    // → false (sibling)
isChildOpd("123", "12")     // → false (parent)
isChildOpd("1", "anything") // → true  (root has access to all)
```

### **getOpdLikePattern(opdId)**
Generate ILIKE pattern for SQL query (PostgreSQL case-insensitive)

```javascript
const { getOpdLikePattern } = require("@/utils/siasn-proxy/helpers");

getOpdLikePattern("123")   // → "123%"
getOpdLikePattern("1")     // → "%"     (admin sees all)
getOpdLikePattern("12345") // → "12345%"
```

### **getOpdLevel(opdId)**
Get OPD level based on ID length

```javascript
const { getOpdLevel } = require("@/utils/siasn-proxy/helpers");

getOpdLevel("1")      // → 1  (root)
getOpdLevel("12")     // → 2  (level 1)
getOpdLevel("123")    // → 3  (level 2)
getOpdLevel("1234")   // → 4  (level 3)
getOpdLevel("12345")  // → 5  (level 4)
```

---

## ⚙️ Configuration

### **Enable/Disable Hierarchical Access**

By default, hierarchical access is **enabled**. To disable (exact match only):

```javascript
// In controller
const result = await query
  .applyProxyPangkatFilters(filters, opdId, { 
    includeChildren: false  // ← Disable hierarchical access
  });

// SQL generated:
// WHERE skpd_id = '123'  (exact match only)
// Instead of:
// WHERE skpd_id ILIKE '123%'  (hierarchical)
```

---

## 📋 Summary

| Feature | Status | SQL Pattern |
|---------|--------|-------------|
| **Admin Access** | ✅ All data | No filter |
| **Hierarchical Access** | ✅ Parent + Children | `ILIKE '123%'` |
| **Exact Match Only** | ✅ Optional | `= '123'` |
| **Filter by NIP** | ✅ Supported | `AND nip ILIKE '%...%'` |
| **Filter by Nama** | ✅ Supported | `AND nama ILIKE '%...%'` |
| **Filter by Periode** | ✅ Supported | `AND periode ILIKE '2025-12%'` |
| **Filter by SKPD ID** | ✅ Supported | `AND skpd_id ILIKE 'X%'` |
| **Download All (limit=-1)** | ✅ Supported | No LIMIT clause |

---

## 🔍 Debugging

### **Check User Access**
```javascript
const { getOpdIdFromUser, isChildOpd } = require("@/utils/siasn-proxy/helpers");

// Get user's OPD ID
const opdId = getOpdIdFromUser(req.user);
console.log("User OPD ID:", opdId);

// Check if user has access to specific OPD
const hasAccess = isChildOpd(opdId, "1234");
console.log("Has access to 1234:", hasAccess);
```

### **Log SQL Query**
```javascript
// Enable query logging
query
  .applyProxyPangkatFilters(filters, opdId)
  .debug() // ← Shows generated SQL
  .page(pageNum - 1, limitNum);
```

---

## 🚀 Performance Considerations

### **Index Recommendations**

```sql
-- For hierarchical ILIKE queries (PostgreSQL)
CREATE INDEX idx_sync_pegawai_skpd_id_prefix 
ON sync_pegawai (skpd_id text_pattern_ops);

-- For JOIN performance
CREATE INDEX idx_proxy_pangkat_nip 
ON siasn_proxy.proxy_pangkat (nip);

-- For periode filter (case-insensitive)
CREATE INDEX idx_proxy_pangkat_periode 
ON siasn_proxy.proxy_pangkat (periode text_pattern_ops);
```

### **Query Optimization**
- ILIKE with prefix (`'123%'`) can use index efficiently with `text_pattern_ops`
- Avoid using ILIKE with leading wildcard (`'%123'`) - cannot use index
- For PostgreSQL, ILIKE is case-insensitive (better for user input)
- Consider materialized views for frequently accessed hierarchies

---

**Last Updated:** 2025-11-15  
**Version:** 1.0.0

