# AI Insight Error Troubleshooting Guide

## Error: "Unexpected end of JSON input"

### Penyebab Umum

Error ini terjadi saat parsing response JSON dari OpenAI API gagal. Beberapa penyebab:

1. **OpenAI Response Kosong**
   - API key tidak valid atau expired
   - Vector store ID tidak ditemukan
   - Quota OpenAI habis
   - Network timeout

2. **Response Tidak Valid**
   - JSON tidak lengkap dari OpenAI
   - Response terpotong karena token limit
   - API error dari OpenAI (rate limit, server error)

3. **Data Input Tidak Valid**
   - Profile data kosong atau null
   - Field yang diperlukan tidak ada (jabatan, unit)

### Solusi yang Sudah Diimplementasikan

#### 1. Input Validation ✅

```javascript
// Validasi profile input
if (!profile || typeof profile !== "object") {
  throw new Error("Profile data is required and must be an object");
}

// Validasi field critical
if (!nama_jabatan && !unor_nama) {
  throw new Error("Minimal jabatan atau unit kerja harus tersedia");
}
```

**Log yang muncul:**
```
✅ Profile validation passed { has_nama: true, has_jabatan: true, ... }
```

#### 2. Response Validation ✅

```javascript
// Cek response kosong
if (!jsonText) {
  log.error("❌ OpenAI response is empty or undefined");
  throw new Error("OpenAI response is empty");
}

// Cek JSON parsing
try {
  insightTemplate = JSON.parse(jsonText);
} catch (parseError) {
  log.error("❌ Failed to parse OpenAI JSON response", {
    response_preview: jsonText.substring(0, 200)
  });
  throw new Error(`Invalid JSON from OpenAI: ${parseError.message}`);
}
```

**Log yang muncul jika error:**
```
❌ OpenAI response is empty or undefined { response_id: ..., model: ... }
❌ Failed to parse OpenAI JSON response { response_preview: "...", ... }
```

#### 3. Structure Validation ✅

```javascript
// Validasi struktur insight
if (!insightTemplate.header || !insightTemplate.snapshot ||
    !insightTemplate.deep_insight || !insightTemplate.closing) {
  log.error("❌ Invalid insight structure from AI");
  throw new Error("AI response missing required sections");
}
```

**Log yang muncul:**
```
✅ Insight structure validation passed
```

### Cara Debugging

#### 1. Cek Log Secara Berurutan

Log akan muncul dalam urutan ini jika sukses:
```
✅ Profile validation passed
🤖 Calling OpenAI API for PPPK insight generation...
✅ OpenAI response received, length: 1234 chars
✅ Successfully parsed AI insight template
✅ Insight structure validation passed
🔄 Filling PII placeholders with real data...
✅ PII placeholders filled successfully
✅ AI insight generation completed successfully
```

**Jika error terjadi, log akan berhenti di titik error:**
```
✅ Profile validation passed
🤖 Calling OpenAI API for PPPK insight generation...
❌ OpenAI response is empty or undefined  ← ERROR DI SINI!
```

#### 2. Identifikasi Titik Error

| Log Error | Penyebab | Solusi |
|-----------|----------|--------|
| `❌ Invalid profile input` | Profile null/undefined | Cek data pengadaan, pastikan `usulan_data.data` ada |
| `❌ Missing critical profile data` | Jabatan & unit kosong | Pastikan minimal ada jabatan atau unit kerja |
| `❌ OpenAI response is empty` | API error atau network issue | Cek OPENAI_API_KEY, cek network, cek quota |
| `❌ Failed to parse OpenAI JSON` | JSON tidak valid dari API | Cek `response_preview` di log, mungkin API error |
| `❌ Invalid insight structure` | Schema mismatch | Cek template_keys di log, OpenAI tidak follow schema |

#### 3. Cek Environment Variables

```bash
# Pastikan env vars ada
echo $OPENAI_API_KEY
# Output: sk-proj-...

# Cek di aplikasi
node -e "console.log(process.env.OPENAI_API_KEY)"
```

#### 4. Test OpenAI API Directly

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Jika sukses:**
```json
{
  "object": "list",
  "data": [...]
}
```

**Jika error:**
```json
{
  "error": {
    "message": "Incorrect API key provided",
    "type": "invalid_request_error"
  }
}
```

### Solusi Berdasarkan Error

#### Error: "OpenAI response is empty"

**Kemungkinan penyebab:**
1. API key tidak valid
2. Vector store ID tidak ditemukan
3. Network timeout
4. Quota habis

**Cara cek:**
```javascript
// Test sederhana
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Test" }]
    });
    console.log("✅ OpenAI API working:", response.choices[0].message.content);
  } catch (error) {
    console.error("❌ OpenAI API error:", error.message);
  }
}

test();
```

**Solusi:**
- Cek dan update `OPENAI_API_KEY`
- Cek quota di https://platform.openai.com/usage
- Cek vector store masih ada: https://platform.openai.com/storage/vector_stores

#### Error: "Invalid JSON from OpenAI"

**Kemungkinan penyebab:**
1. Response terpotong karena max_tokens
2. JSON schema terlalu kompleks
3. Server error dari OpenAI

**Cara cek:**
```javascript
// Log akan menampilkan response_preview
// Cek apakah JSON terpotong di tengah
log.error("❌ Failed to parse OpenAI JSON response", {
  response_preview: jsonText.substring(0, 200),  // Cek ini!
  response_length: jsonText.length
});
```

**Solusi:**
- Jika response terpotong: tambah `max_tokens` di API call
- Jika error message muncul: handle error dari OpenAI
- Retry dengan exponential backoff

#### Error: "AI response missing required sections"

**Kemungkinan penyebab:**
1. JSON schema tidak diikuti oleh AI
2. Schema definition error
3. AI tidak bisa generate semua section

**Cara cek:**
```javascript
// Log akan menampilkan keys yang ada
log.error("❌ Invalid insight structure from AI", {
  template_keys: Object.keys(insightTemplate)  // Cek ini!
});
```

**Solusi:**
- Cek `template_keys` vs expected keys
- Jika ada keys yang salah: update JSON schema
- Jika section hilang: simplify prompt atau schema

### Best Practices untuk Mencegah Error

#### 1. Validasi Input Sebelum Call API

```javascript
// ✅ Good
const profile = pengadaan?.usulan_data?.data;
if (!profile) {
  return res.status(400).json({
    error: "Data profile tidak ditemukan"
  });
}

const aiResult = await insightAIForParuhWaktu(profile);
```

#### 2. Handle Network Errors

```javascript
// ✅ Good - dengan retry
const MAX_RETRIES = 3;
let lastError;

for (let i = 0; i < MAX_RETRIES; i++) {
  try {
    const resp = await openai.responses.create({ ... });
    return resp; // Success!
  } catch (error) {
    lastError = error;
    if (i < MAX_RETRIES - 1) {
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
    }
  }
}

throw lastError; // All retries failed
```

#### 3. Monitor API Usage

```javascript
// Setup monitoring
const result = await insightAIForParuhWaktu(profile);

// Log success metrics
log.info("📊 AI Insight Metrics", {
  model: result.metadata.model,
  response_id: result.metadata.response_id,
  timestamp: result.metadata.generated_at
});
```

### Monitoring Checklist

- [ ] Cek log untuk error patterns
- [ ] Monitor OpenAI API usage & costs
- [ ] Track success/failure rate
- [ ] Set up alerts untuk error rate tinggi
- [ ] Monitor response time (should be 2-5s)

### Support Resources

- **OpenAI Status**: https://status.openai.com/
- **OpenAI Platform**: https://platform.openai.com/
- **OpenAI Docs**: https://platform.openai.com/docs/
- **API Reference**: https://platform.openai.com/docs/api-reference/

---

**Last Updated:** 2025-11-02
**Status:** Active Monitoring
