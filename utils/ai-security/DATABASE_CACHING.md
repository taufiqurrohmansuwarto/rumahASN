# AI Insight Database Caching

## 🎯 Konsep

**Database sebagai cache untuk AI insight** agar tidak perlu generate ulang setiap kali user request.

### **Flow:**
```
User Request → Cek Database → Found? Return Cache : Generate AI → Save to DB → Return
```

---

## 📊 Database Schema

### **Table: `ai_insight.paruh_waktu`**

```sql
CREATE SCHEMA IF NOT EXISTS "ai_insight";

CREATE TABLE ai_insight.paruh_waktu (
  id VARCHAR PRIMARY KEY,           -- Unique ID (nanoid)
  source_id VARCHAR UNIQUE,         -- ID pengadaan (unique per user)
  user_id VARCHAR,                  -- User yang request
  data JSONB,                       -- Profile data (ASLI, tidak di-mask)
  result JSONB,                     -- AI insight result (ASLI)
  metadata JSONB,                   -- Metadata generation
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Field Details:**

| Field       | Type    | Description                                        | Example                                  |
| ----------- | ------- | -------------------------------------------------- | ---------------------------------------- |
| `id`        | VARCHAR | Primary key (nanoid)                               | `"a1b2c3d4e5f6g7h8"`                     |
| `source_id` | VARCHAR | **UNIQUE** - ID pengadaan                          | `"550e8400-e29b-41d4-a716-446655440000"` |
| `user_id`   | VARCHAR | User yang request                                  | `"custom_id_123"`                        |
| `data`      | JSONB   | Profile data ASLI (nama lengkap, tanggal lahir)    | `{ profile_summary: {...}, profile_raw: {...} }` |
| `result`    | JSONB   | AI insight result ASLI (sudah di-fill placeholder) | `{ insight: {...}, metadata: {...} }`    |
| `metadata`  | JSONB   | Generation metadata                                | `{ model: "gpt-4o-mini", ... }`          |

---

## 🔄 Implementation Flow

### **1. First Request (Generate & Save)**

```javascript
// User request dengan id pengadaan
GET /api/pengadaan/ai-insight?id=550e8400-e29b-41d4-a716-446655440000

// Controller check database
const existingInsight = await AIInsightParuhWaktu.query()
  .where("source_id", id)
  .first();

// Not found → Generate with AI
if (!existingInsight) {
  const aiResult = await insightAIForParuhWaktu(profile);

  // Save to database
  await AIInsightParuhWaktu.query().insert({
    id: nanoid(),
    source_id: id,
    user_id: userId,
    data: {
      profile_summary: aiResult.profile_summary, // Data ASLI
      profile_raw: profile
    },
    result: {
      insight: aiResult.insight, // Insight ASLI (sudah di-fill)
      metadata: aiResult.metadata
    }
  });
}

// Response:
{
  success: true,
  from_cache: false,
  profile_summary: {
    nama: "Budi Santoso",  // ✅ Data ASLI (tidak di-mask)
    jabatan: "Analis SDM",
    unit: "BKD Jawa Timur"
  },
  insight: {
    header: {
      sapaan_hangat: "Halo Budi! Sebagai Analis SDM..." // ✅ Sudah di-fill
    }
  }
}
```

**Cost:** ~$0.001 (1x AI call)
**Time:** ~2-5 seconds (AI generation)

---

### **2. Second Request (From Cache)**

```javascript
// User request dengan id yang sama
GET /api/pengadaan/ai-insight?id=550e8400-e29b-41d4-a716-446655440000

// Controller check database
const existingInsight = await AIInsightParuhWaktu.query()
  .where("source_id", id)
  .first();

// Found! → Return from cache
if (existingInsight) {
  return res.json({
    success: true,
    from_cache: true, // ✅ Dari cache!
    cached_at: existingInsight.created_at,
    profile_summary: existingInsight.data.profile_summary,
    insight: existingInsight.result.insight
  });
}
```

**Cost:** $0 (no AI call!)
**Time:** <100ms (database query)

---

## 🔐 Security: Data Storage

### **Data yang Dikirim ke AI (Hybrid Approach):**

```javascript
// NON-PII (Direct)
{
  jabatan: "Analis SDM",
  unit_kerja: "BKD Jawa Timur",
  pendidikan: "S1 Ilmu Komputer"
}

// PII (Placeholder)
{
  nama: "{{nama_depan}}",        // AI tidak tahu "Budi"
  tgl_lahir: "{{tgl_lahir}}"     // AI tidak tahu "1990"
}
```

### **Data yang Disimpan di Database (Full Data):**

```json
{
  "data": {
    "profile_summary": {
      "nama": "Budi Santoso",           // ✅ ASLI (untuk display ke user)
      "jabatan": "Analis SDM",
      "unit": "BKD Jawa Timur"
    },
    "profile_raw": {
      "nama": "Budi Santoso",
      "nip": "199203012023011001",
      "tgl_lahir": "1990-05-15",
      // ... semua data asli
    }
  },
  "result": {
    "insight": {
      "header": {
        "sapaan_hangat": "Halo Budi! Sebagai Analis SDM..." // ✅ Sudah di-fill
      }
    }
  }
}
```

**Key Points:**
- ✅ Data di database adalah **ASLI** (tidak di-mask)
- ✅ Database di server internal (tidak exposed ke public)
- ✅ User authorized dapat akses data mereka sendiri
- ✅ AI **TIDAK pernah** menerima PII dalam bentuk asli

---

## 📈 Performance & Cost Comparison

| Request | Method        | AI Call? | Cost      | Time    |
| ------- | ------------- | -------- | --------- | ------- |
| **1st** | Generate + Save | ✅ Yes  | ~$0.001   | ~2-5s   |
| **2nd** | From Cache     | ❌ No    | $0        | <100ms  |
| **3rd** | From Cache     | ❌ No    | $0        | <100ms  |
| **Nth** | From Cache     | ❌ No    | $0        | <100ms  |

### **Savings Example (1000 users):**

**Without Caching:**
- Requests: 1000 × 5 times = 5000 requests
- Cost: 5000 × $0.001 = **$5.00**
- Time: 5000 × 3s = **4.2 hours**

**With Caching:**
- First request: 1000 × 1 time = 1000 requests (generate)
- Next requests: 1000 × 4 times = 4000 requests (cache)
- Cost: 1000 × $0.001 + 4000 × $0 = **$1.00** ✅ Save $4!
- Time: 1000 × 3s + 4000 × 0.1s = **57 minutes** ✅ Save 3.2 hours!

---

## 🔄 Cache Invalidation

### **When to Regenerate?**

Saat ini, cache **PERMANENT** (tidak ada expiry). Jika ingin regenerate:

```javascript
// Delete cache
await AIInsightParuhWaktu.query()
  .where("source_id", pengadaanId)
  .delete();

// Next request akan generate ulang
```

### **Optional: Add Expiry (Future Enhancement)**

```javascript
// Check if cache is stale (> 30 days)
const cacheAge = Date.now() - new Date(existingInsight.created_at).getTime();
const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

if (cacheAge > maxAge) {
  // Delete old cache
  await existingInsight.$query().delete();

  // Generate new
  const aiResult = await insightAIForParuhWaktu(profile);
  // ... save new
}
```

---

## 📊 Database Structure Example

```json
{
  "id": "a1b2c3d4e5f6g7h8",
  "source_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "custom_id_123",
  "data": {
    "profile_summary": {
      "nama": "Budi Santoso",
      "jabatan": "Analis SDM",
      "unit": "BKD Jawa Timur",
      "instansi": "Pemerintah Provinsi Jawa Timur",
      "status": "PPPK Paruh Waktu"
    },
    "profile_raw": {
      "nama": "Budi Santoso",
      "nip": "199203012023011001",
      "tgl_lahir": "1990-05-15",
      "tempat_lahir": "Surabaya",
      "pendidikan_ijazah_nama": "S1 Ilmu Komputer",
      "tahun_lulus": "2015",
      "jabatan_fungsional_umum_nama": "Analis SDM",
      "unor_nama": "BKD Jawa Timur",
      "instansi_kerja_nama": "Pemerintah Provinsi Jawa Timur",
      "tgl_kontrak_mulai": "2023-01-01",
      "tgl_kontrak_akhir": "2025-12-31",
      "golongan": "III/a"
    }
  },
  "result": {
    "insight": {
      "header": {
        "sapaan_hangat": "Halo Budi! Sebagai Analis SDM di BKD Jawa Timur, kontribusi Anda dalam mengelola data kepegawaian sangat krusial.",
        "tagline": "Dengan latar S1 Ilmu Komputer, Anda memiliki kombinasi unik teknologi dan kepegawaian yang sangat dibutuhkan.",
        "ilustrasi_peran": "Di BKD Jawa Timur, peran Analis SDM adalah kunci untuk modernisasi sistem kepegawaian dan digitalisasi data ASN."
      },
      "snapshot": {
        "masa_kerja_hari": 730,
        "fase_karir": "Expert",
        "highlight_kekuatan": "Kombinasi skill teknologi dari S1 Ilmu Komputer dengan pemahaman kepegawaian membuat Anda unggul dalam digitalisasi sistem.",
        "area_pengembangan": "Perdalam pengetahuan regulasi ASN dan SIASN untuk memaksimalkan potensi karir ke Staff Ahli SDM."
      },
      "deep_insight": {
        "pola_karir": "S1 Ilmu Komputer → Analis SDM di BKD Jawa Timur → Staff Ahli SDM atau System Analyst Kepegawaian",
        "peluang_tersembunyi": "Posisi paruh waktu di BKD memberi akses ke network kepegawaian provinsi dan kesempatan berkontribusi di modernisasi sistem.",
        "red_flag": "Pastikan terus update skill teknologi karena sistem kepegawaian terus berkembang (SIASN, MyASN, dll).",
        "next_level": "Ikuti pelatihan SIASN Advanced, bangun portfolio project digitalisasi, dan prepare untuk PPPK penuh atau PNS."
      },
      "referensi": [],
      "closing": {
        "motivasi": "Budi, kontribusi Anda sebagai Analis SDM di BKD Jawa Timur sangat berarti untuk modernisasi kepegawaian. Terus semangat!",
        "tips_praktis": "Minggu ini: explore fitur advanced SIASN dan dokumentasikan 1 workflow yang bisa Anda otomasi."
      }
    },
    "metadata": {
      "generated_at": "2025-11-02T10:00:00Z",
      "response_id": "resp_abc123",
      "model": "gpt-4o-mini",
      "security": {
        "pii_protected": true,
        "method": "hybrid_placeholder"
      }
    }
  },
  "metadata": {
    "generated_at": "2025-11-02T10:00:00Z",
    "source_type": "pengadaan",
    "model": "gpt-4o-mini",
    "response_id": "resp_abc123"
  },
  "created_at": "2025-11-02T10:00:00Z",
  "updated_at": "2025-11-02T10:00:00Z"
}
```

---

## ✅ Benefits Summary

| Aspect              | Value                                      |
| ------------------- | ------------------------------------------ |
| **Cost Saving**     | 80% (only 1st request costs)               |
| **Performance**     | 95% faster (cache: <100ms vs AI: 2-5s)     |
| **PII Security**    | 100% (AI never sees PII, data safe in DB)  |
| **Data Integrity**  | Full data saved (for audit/reporting)      |
| **Scalability**     | High (database can handle millions)        |
| **User Experience** | Instant response after 1st generation      |

---

**Status:** ✅ Production Ready
**Last Updated:** 2025-11-02
