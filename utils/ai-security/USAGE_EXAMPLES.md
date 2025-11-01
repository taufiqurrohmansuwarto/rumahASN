# AI Security - Usage Examples

Contoh konkret penggunaan AI Security utilities untuk berbagai kasus.

---

## 1. Template-Based Insight (RECOMMENDED)

### Kasus: Generate insight untuk ribuan pegawai

```javascript
const {
  generateInsightTemplate,
  insightAIForParuhWaktuFromTemplate,
} = require("../helper/ai-insight.helper");

// ═══════════════════════════════════════════════════════
// STEP 1: Generate template SEKALI (run di background job)
// ═══════════════════════════════════════════════════════
const { template } = await generateInsightTemplate();

// Simpan template ke database atau Redis
await db.aiTemplates.create({
  name: "pppk_paruh_waktu_insight",
  version: "1.0",
  template: template,
  created_at: new Date(),
});

// ═══════════════════════════════════════════════════════
// STEP 2: Untuk setiap pegawai, REUSE template
// ═══════════════════════════════════════════════════════
const pegawaiList = await db.pegawai.find({ status: "PPPK Paruh Waktu" });

for (const pegawai of pegawaiList) {
  // Fill template di SERVER (AI tidak tahu PII!)
  const insight = await insightAIForParuhWaktuFromTemplate(pegawai, template);

  // Simpan hasil
  await db.insights.create({
    nip: pegawai.nip,
    insight: insight.insight,
    generated_at: new Date(),
  });

  console.log(`✅ Insight generated for ${pegawai.nama}`);
}

// HASIL:
// ✅ AI hanya dipanggil 1x (generate template)
// ✅ 1000 pegawai = 1 API call (bukan 1000!)
// ✅ Cost: $0.001 (bukan $1.00)
// ✅ PII aman: AI tidak pernah tahu nama pegawai
```

---

## 2. Real-time Insight dengan Template Cache

### Kasus: User request insight, tapi template sudah ada di cache

```javascript
// Controller
const getInsightForUser = async (req, res) => {
  try {
    const { nip } = req.user;
    const pegawai = await db.pegawai.findOne({ nip });

    // Check cache untuk template
    let template = await redis.get("template:pppk_insight");

    if (!template) {
      // Generate template jika belum ada
      const { template: newTemplate } = await generateInsightTemplate();
      template = newTemplate;

      // Cache selama 7 hari
      await redis.setex(
        "template:pppk_insight",
        7 * 24 * 60 * 60,
        JSON.stringify(template)
      );
    } else {
      template = JSON.parse(template);
    }

    // Fill template dengan data user (TANPA call AI lagi!)
    const insight = await insightAIForParuhWaktuFromTemplate(
      pegawai,
      template
    );

    res.json({
      success: true,
      data: insight,
      meta: {
        cached_template: true,
        ai_call: false, // ✅ Tidak ada AI call!
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// HASIL:
// ⚡ Response time: <100ms (bukan 2-5 detik)
// 💰 Cost: $0 per request (template dari cache)
// 🔒 Security: PII tidak pernah ke AI
```

---

## 3. Masking PII untuk Logging/Analytics

### Kasus: Log aktivitas user tapi sembunyikan PII

```javascript
const { maskName, maskNIP, maskEmail } = require("../ai-security/masking");
const { hashNIP } = require("../ai-security/anonymizer");

// Logger middleware
const logUserActivity = (req, res, next) => {
  const user = req.user;

  // Log dengan PII ter-mask
  logger.info({
    timestamp: new Date(),
    user_id: hashNIP(user.nip), // Hash konsisten untuk tracking
    user_name_masked: maskName(user.nama), // "B*** S******"
    email_masked: maskEmail(user.email), // "b***@gmail.com"
    action: req.path,
    ip: req.ip,
  });

  next();
};

// HASIL LOG:
// {
//   "timestamp": "2025-11-02T10:00:00Z",
//   "user_id": "H_a1b2c3d4e5f6g7h8",
//   "user_name_masked": "B*** S******",
//   "email_masked": "b***@gmail.com",
//   "action": "/api/insights",
//   "ip": "192.168.1.1"
// }

// ✅ Bisa track user behavior
// ✅ Bisa aggregate analytics
// ✅ Tidak melanggar privacy
```

---

## 4. Validate Data Sebelum Kirim ke AI (Fallback)

### Kasus: Jika terpaksa kirim data ke AI, validate dulu

```javascript
const { containsPII, validateForAI } = require("../ai-security/security-checker");
const { maskName, generalizeDate } = require("../ai-security/masking");

const sendToAI = async (userData) => {
  // Check PII
  const check = containsPII(userData);

  if (check.hasPII) {
    console.warn(`⚠️  PII detected in fields: ${check.piiFields.join(", ")}`);

    // Auto-mask PII fields
    const safeData = {
      ...userData,
      nama: userData.nama ? maskName(userData.nama) : undefined,
      nip: undefined, // Hapus NIP
      nik: undefined, // Hapus NIK
      tgl_lahir: userData.tgl_lahir
        ? generalizeDate(userData.tgl_lahir)
        : undefined,
    };

    // Validate lagi
    try {
      validateForAI(safeData);
      console.log("✅ Data is now safe for AI");

      // Kirim ke AI
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: JSON.stringify(safeData) }],
      });

      return response;
    } catch (e) {
      throw new Error(`Cannot send to AI: ${e.message}`);
    }
  } else {
    // Data sudah aman, langsung kirim
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: JSON.stringify(userData) }],
    });

    return response;
  }
};
```

---

## 5. Batch Processing dengan Template

### Kasus: Generate insight untuk 1000+ pegawai secara batch

```javascript
const { fillTemplateBatch } = require("../ai-security/template-processor");

// Generate template sekali
const { template } = await generateInsightTemplate();

// Prepare data batch (ambil dari database)
const pegawaiList = await db.pegawai.find({ status: "PPPK Paruh Waktu" });

// Chunk untuk avoid memory issues
const CHUNK_SIZE = 100;
const chunks = _.chunk(pegawaiList, CHUNK_SIZE);

for (const chunk of chunks) {
  // Process chunk
  const insights = await Promise.all(
    chunk.map((pegawai) =>
      insightAIForParuhWaktuFromTemplate(pegawai, template)
    )
  );

  // Bulk insert ke database
  await db.insights.insertMany(
    insights.map((insight, idx) => ({
      nip: chunk[idx].nip,
      insight: insight.insight,
      generated_at: new Date(),
    }))
  );

  console.log(`✅ Processed ${chunk.length} pegawai`);
}

// HASIL:
// ⚡ 1000 pegawai processed dalam < 10 detik
// 💰 Cost: $0.001 (hanya 1x API call untuk template)
// 🔒 Security: PII tetap aman
```

---

## 6. A/B Testing Template Versions

### Kasus: Test 2 versi template, pilih yang terbaik

```javascript
// Generate 2 template versions
const templateV1 = await generateInsightTemplate(); // Temperature: 0.5
const templateV2 = await generateInsightTemplate(); // Temperature: 0.8

// Test dengan sample user
const sampleUsers = await db.pegawai.find().limit(100);

const resultsV1 = [];
const resultsV2 = [];

for (const user of sampleUsers) {
  const insightV1 = await insightAIForParuhWaktuFromTemplate(
    user,
    templateV1.template
  );
  const insightV2 = await insightAIForParuhWaktuFromTemplate(
    user,
    templateV2.template
  );

  resultsV1.push(insightV1);
  resultsV2.push(insightV2);
}

// User feedback
const feedbackV1 = await collectUserFeedback(resultsV1);
const feedbackV2 = await collectUserFeedback(resultsV2);

// Pilih winner
const winner = feedbackV1.avgRating > feedbackV2.avgRating ? "V1" : "V2";
console.log(`🏆 Winner: Template ${winner}`);

// Deploy winner template
await redis.set(
  "template:pppk_insight:production",
  JSON.stringify(winner === "V1" ? templateV1.template : templateV2.template)
);
```

---

## 7. Encryption untuk Data Sensitif (Storage)

### Kasus: Simpan data sensitif di database dengan enkripsi

```javascript
const { encrypt, decrypt } = require("../ai-security/encryption");

// Simpan data pegawai
const savePegawai = async (pegawaiData) => {
  const encryptedData = {
    nama: encrypt(pegawaiData.nama),
    nip: encrypt(pegawaiData.nip),
    nik: encrypt(pegawaiData.nik),
    email: encrypt(pegawaiData.email),
    // Data non-sensitif tidak perlu di-encrypt
    jabatan: pegawaiData.jabatan,
    unit_kerja: pegawaiData.unit_kerja,
  };

  await db.pegawai.create(encryptedData);
};

// Baca data pegawai
const getPegawai = async (id) => {
  const pegawai = await db.pegawai.findById(id);

  return {
    nama: decrypt(pegawai.nama),
    nip: decrypt(pegawai.nip),
    nik: decrypt(pegawai.nik),
    email: decrypt(pegawai.email),
    jabatan: pegawai.jabatan,
    unit_kerja: pegawai.unit_kerja,
  };
};

// HASIL DATABASE:
// {
//   "nama": "1a2b3c:4d5e6f:7g8h9i...", // Encrypted
//   "nip": "9i8h7g:6f5e4d:3c2b1a...",  // Encrypted
//   "jabatan": "Analis SDM"            // Plain text (not sensitive)
// }
```

---

## 8. Kombinasi: Template + Encryption + Masking

### Kasus: Full security implementation

```javascript
const { encrypt, decrypt } = require("../ai-security/encryption");
const { maskName } = require("../ai-security/masking");
const {
  generateInsightTemplate,
  insightAIForParuhWaktuFromTemplate,
} = require("../helper/ai-insight.helper");

// STEP 1: Data tersimpan dengan encryption
const encryptedPegawai = {
  id: 123,
  nama_encrypted: encrypt("Budi Santoso"),
  nip_encrypted: encrypt("199203012023011001"),
  // ... fields lain
};

// STEP 2: Decrypt untuk processing
const pegawai = {
  nama: decrypt(encryptedPegawai.nama_encrypted),
  nip: decrypt(encryptedPegawai.nip_encrypted),
  // ...
};

// STEP 3: Generate insight dengan template (AI tidak tahu PII!)
const template = await getTemplateFromCache();
const insight = await insightAIForParuhWaktuFromTemplate(pegawai, template);

// STEP 4: Log dengan masked data
logger.info({
  user: maskName(pegawai.nama), // "B*** S******"
  action: "insight_generated",
  timestamp: new Date(),
});

// STEP 5: Return ke client (decrypt untuk display)
res.json({
  success: true,
  profile: {
    nama: pegawai.nama, // "Budi Santoso" (decrypted)
    insight: insight.insight,
  },
});

// SECURITY LAYERS:
// ✅ Database: Encrypted
// ✅ AI Provider: Template (no PII sent)
// ✅ Logs: Masked
// ✅ Client: Decrypted (authorized user only)
```

---

## Best Practice Summary

| Skenario                        | Tool yang Digunakan             | PII Protection Level |
| ------------------------------- | ------------------------------- | -------------------- |
| Generate insight untuk user     | Template-based                  | 🔒🔒🔒🔒🔒 (100%)    |
| Storage di database             | Encryption                      | 🔒🔒🔒🔒🔒 (100%)    |
| Logging/Analytics               | Masking + Hashing               | 🔒🔒🔒🔒 (95%)       |
| Kirim ke AI (fallback only)     | Masking + Generalization        | 🔒🔒🔒 (80%)         |
| Display ke authorized user      | Decrypt (if encrypted)          | ✅ OK                |
| Public API/Export               | Masking + Anonymization         | 🔒🔒🔒🔒 (95%)       |
| Kirim nama real ke AI (OLD WAY) | ❌ JANGAN! Use template instead | ❌ MELANGGAR!        |

---

**GOLDEN RULE**: Gunakan **template-based approach** untuk semua AI insight generation!
