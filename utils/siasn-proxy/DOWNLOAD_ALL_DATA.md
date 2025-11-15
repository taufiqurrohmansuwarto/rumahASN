# Download All Data Feature (limit = -1)

## 📖 Overview

Feature untuk mengambil **semua data tanpa pagination** dengan menggunakan parameter `limit=-1`. Berguna untuk kebutuhan **download/export** data dalam jumlah besar.

---

## 🎯 Use Cases

1. **Export to Excel/CSV** - Download semua data untuk export
2. **Reporting** - Generate report dengan semua data
3. **Backup** - Backup data lengkap
4. **Data Analysis** - Analisis data tanpa perlu loop pagination

---

## 🔧 How to Use

### **Basic Usage**
```bash
GET /api/siasn/ws/admin/proxy/pangkat?limit=-1
Authorization: Bearer <token>
```

### **With Filters**
```bash
# Download all data dengan filter NIP
GET /api/siasn/ws/admin/proxy/pangkat?limit=-1&nip=1984

# Download all data dengan filter periode
GET /api/siasn/ws/admin/proxy/pangkat?limit=-1&periode=December 2025

# Download all data dengan multiple filters
GET /api/siasn/ws/admin/proxy/pangkat?limit=-1&nip=1984&periode=December 2025&status_usulan=1
```

---

## 📊 Response Format

### **Regular Pagination (limit > 0):**
```json
{
  "success": true,
  "data": [...], // 10 items (or specified limit)
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5000,
    "totalPages": 500,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### **Download All (limit = -1):**
```json
{
  "success": true,
  "data": [...], // ALL items (could be 5000+ items)
  "total": 5000,
  "showAll": true
}
```

**Note:** Response tidak include `pagination` object karena tidak ada pagination.

---

## 🔐 Authorization

Feature `limit=-1` tetap respect **authorization rules**:

### **Admin (organization_id = "1"):**
```bash
GET /api/siasn/ws/admin/proxy/pangkat?limit=-1
# Returns: ALL data from ALL OPDs
```

### **Operator (organization_id = "123"):**
```bash
GET /api/siasn/ws/admin/proxy/pangkat?limit=-1
# Returns: ALL data from "123%" (parent + children) only
```

---

## 💻 Frontend Example

### **React Hook for Download:**

```javascript
import { useState } from "react";
import { message } from "antd";

function useDownloadPangkat() {
  const [loading, setLoading] = useState(false);

  const downloadAll = async (filters = {}) => {
    setLoading(true);
    try {
      // Fetch all data with limit=-1
      const response = await fetch(
        `/api/siasn/ws/admin/proxy/pangkat?limit=-1&${new URLSearchParams(filters)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        message.success(`Downloaded ${result.total} records`);
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error("Failed to download data");
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { downloadAll, loading };
}

// Usage:
function DownloadButton() {
  const { downloadAll, loading } = useDownloadPangkat();

  const handleDownload = async () => {
    const data = await downloadAll({
      periode: "2025-12",
      status_usulan: 1,
    });

    // Convert to Excel using library (e.g., xlsx)
    if (data.length > 0) {
      exportToExcel(data);
    }
  };

  return (
    <Button onClick={handleDownload} loading={loading}>
      Download All Data
    </Button>
  );
}
```

### **Export to Excel:**

```javascript
import { utils, write } from "xlsx";
import { saveAs } from "file-saver";

function exportToExcel(data) {
  // Transform data for Excel
  const excelData = data.map((item, index) => ({
    No: index + 1,
    NIP: item.nip,
    Nama: item.nama,
    "Jenis Layanan": item.jenis_layanan_nama,
    Periode: item.periode,
    Status: item.status_usulan,
    // Pegawai data
    "Foto URL": item.pegawai?.foto || "-",
    "OPD": item.pegawai?.opd_master || "-",
    "Jabatan": item.pegawai?.jabatan_master || "-",
  }));

  // Create workbook
  const workbook = utils.book_new();
  const worksheet = utils.json_to_sheet(excelData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 5 },  // No
    { wch: 20 }, // NIP
    { wch: 30 }, // Nama
    { wch: 20 }, // Jenis Layanan
    { wch: 15 }, // Periode
    { wch: 10 }, // Status
    { wch: 50 }, // Foto URL
    { wch: 30 }, // OPD
    { wch: 30 }, // Jabatan
  ];

  // Add worksheet to workbook
  utils.book_append_sheet(workbook, worksheet, "Data Pangkat");

  // Generate file
  const excelBuffer = write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // Save file
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  
  saveAs(blob, `pangkat_${new Date().getTime()}.xlsx`);
}
```

---

## ⚡ Performance Considerations

### **SQL Query:**

```sql
-- Regular pagination (limit = 10)
SELECT * FROM siasn_proxy.proxy_pangkat
WHERE ...
ORDER BY tgl_usulan DESC
LIMIT 10 OFFSET 0;
-- Fast: Returns 10 rows

-- Download all (limit = -1)
SELECT * FROM siasn_proxy.proxy_pangkat
WHERE ...
ORDER BY tgl_usulan DESC;
-- Can be slow: Returns ALL rows (could be 10,000+)
```

### **Best Practices:**

1. **Use Filters** - Always add filters to limit data scope
   ```bash
   # ✅ Good: Filter by periode
   GET /api/.../proxy/pangkat?limit=-1&periode=2025-12
   
   # ❌ Bad: No filter, could return millions of rows
   GET /api/.../proxy/pangkat?limit=-1
   ```

2. **Add Timeout** - Set longer timeout for download requests
   ```javascript
   fetch(url, {
     signal: AbortSignal.timeout(60000), // 60 seconds
   });
   ```

3. **Show Progress** - Use loading indicator for user feedback
   ```javascript
   <Spin tip="Downloading data..." spinning={loading}>
     <Button onClick={download}>Download</Button>
   </Spin>
   ```

4. **Limit Frequency** - Prevent abuse with rate limiting
   ```javascript
   // Backend: Add rate limiter
   app.use("/api/.../proxy/pangkat", rateLimit({
     windowMs: 60000, // 1 minute
     max: 5, // Max 5 requests per minute for download
     skip: (req) => req.query.limit !== "-1", // Only for download requests
   }));
   ```

---

## 🚨 Caveats & Warnings

### ⚠️ **Memory Usage**
```
10,000 records × 2 KB/record = 20 MB memory
50,000 records × 2 KB/record = 100 MB memory
100,000+ records = Potential Out of Memory!
```

**Solution:** Implement streaming or chunked download for very large datasets.

### ⚠️ **Response Time**
```
1,000 records   = ~1-2 seconds
10,000 records  = ~5-10 seconds
100,000 records = ~30-60 seconds or timeout!
```

**Solution:** Add filters to reduce dataset size.

### ⚠️ **Database Load**
Large queries without LIMIT can cause database performance issues.

**Solution:** Use database indexes and query optimization.

---

## 🛡️ Security

### **Authorization Still Applied:**
```javascript
// User with organization_id = "123"
GET /api/.../proxy/pangkat?limit=-1

// SQL:
SELECT * FROM siasn_proxy.proxy_pangkat
JOIN sync_pegawai ON ...
WHERE sync_pegawai.skpd_id ILIKE '123%'  -- ✅ Still filtered!
ORDER BY tgl_usulan DESC;
-- No LIMIT clause, but still respects OPD hierarchy
```

### **Prevent Abuse:**
```javascript
// Backend validation
if (limit === -1 && !hasValidFilters(filters)) {
  return res.status(400).json({
    error: "Please add filters when downloading all data"
  });
}
```

---

## 🧪 Testing

### **Test 1: Download All with Filter**
```bash
GET /api/siasn/ws/admin/proxy/pangkat?limit=-1&periode=2025-12
Authorization: Bearer <token>

# Expected:
{
  "success": true,
  "data": [...], // All records for Dec 2025
  "total": 156,
  "showAll": true
}
```

### **Test 2: Download All without Filter (Operator)**
```bash
GET /api/siasn/ws/admin/proxy/pangkat?limit=-1
Authorization: Bearer <operator-token>

# Expected:
{
  "success": true,
  "data": [...], // All records for user's OPD hierarchy
  "total": 523,
  "showAll": true
}
```

### **Test 3: Compare with Pagination**
```bash
# Paginated
GET /api/siasn/ws/admin/proxy/pangkat?page=1&limit=10

# Download all
GET /api/siasn/ws/admin/proxy/pangkat?limit=-1

# Both should return same data, but different structure
```

---

## 📋 Summary

| Feature | Regular Pagination | Download All (limit=-1) |
|---------|-------------------|-------------------------|
| **Query Parameter** | `limit=10` | `limit=-1` |
| **Response** | Paginated | All data |
| **Pagination Object** | ✅ Included | ❌ Not included |
| **Authorization** | ✅ Applied | ✅ Applied |
| **Filters** | ✅ Supported | ✅ Supported |
| **Performance** | Fast | Slower (depends on data size) |
| **Use Case** | Display data | Download/Export |

---

## ✅ Checklist

Before using `limit=-1`:

- [ ] Add appropriate filters to limit scope
- [ ] Set longer timeout for request
- [ ] Show loading indicator to user
- [ ] Test with expected data volume
- [ ] Consider implementing streaming for very large datasets
- [ ] Add rate limiting to prevent abuse
- [ ] Monitor database performance

---

**Last Updated:** 2025-11-15  
**Version:** 1.0.0

