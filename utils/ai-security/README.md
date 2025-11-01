# AI Security Utilities

Koleksi utility untuk melindungi PII (Personally Identifiable Information) sebelum data dikirim ke AI provider eksternal seperti OpenAI.

## Modul yang Tersedia

### 1. `masking.js` - Data Masking
Menyamarkan data sensitif dengan tetap mempertahankan struktur.

```javascript
const { maskName, maskNIP, maskNIK, maskEmail, maskPhone, generalizeDate, generalizeAge } = require('./masking');

// Contoh penggunaan
maskName("Budi Santoso")        // "B*** S*******"
maskNIP("199203012023011001")   // "1992********1001"
maskNIK("3578123456789012")     // "3578********9012"
maskEmail("budi@gmail.com")     // "b***@gmail.com"
maskPhone("081234567890")       // "0812****7890"
generalizeDate("1990-05-15")    // 1990
generalizeAge(35)               // "35-39"
```

### 2. `anonymizer.js` - Data Hashing
Mengubah data menjadi hash yang konsisten tapi tidak bisa di-reverse.

```javascript
const { hashDeterministic, hashSecure, hashNIP, hashNIK } = require('./anonymizer');

// Contoh penggunaan
hashNIP("199203012023011001")   // "H_a1b2c3d4e5f6g7h8"
hashNIK("3578123456789012")     // "NIK_a1b2c3d4e5f6g7h8i9j0"

// Untuk password/data sensitif (async)
await hashSecure("password123")
await verifyHash("password123", hash)
```

**Environment Variables Required:**
```bash
ANONYMIZE_PEPPER="your-secret-pepper-change-this"
```

### 3. `encryption.js` - Data Encryption
Enkripsi AES-256-GCM yang bisa di-decrypt kembali.

```javascript
const { encrypt, decrypt, generateKey } = require('./encryption');

// Generate key (lakukan sekali, simpan di .env)
const key = generateKey();

// Enkripsi & dekripsi
const encrypted = encrypt("data sensitif");
const decrypted = decrypt(encrypted);
```

**Environment Variables Required:**
```bash
ENCRYPTION_KEY="64-character-hex-string-generated-by-generateKey"
```

### 4. `security-checker.js` - PII Detection
Mendeteksi apakah data mengandung PII sebelum dikirim ke AI.

```javascript
const { containsPII, validateForAI, isSafeForAI, PII_FIELDS } = require('./security-checker');

const userData = {
  nama: "Budi",
  jabatan: "Programmer",
  email: "budi@example.com"
};

// Check PII
const check = containsPII(userData);
// { hasPII: true, piiFields: ['nama', 'email'] }

// Validate (throws error if PII found)
try {
  validateForAI(userData);
} catch (e) {
  console.error(e.message);
  // "Cannot send to AI: PII detected in fields: nama, email"
}

// Safe check
isSafeForAI(userData); // false
```

## Implementasi di AI Helper

Contoh implementasi di `utils/helper/ai-insight.helper.js`:

```javascript
const { maskName, generalizeDate } = require("../ai-security/masking");
const { hashNIP, hashNIK } = require("../ai-security/anonymizer");

module.exports.insightAIForParuhWaktu = async (profile) => {
  // 1. Extract data asli
  const { nama, nip, nik, tgl_lahir, tempat_lahir, ...rest } = profile;

  // 2. Mask/anonymize untuk dikirim ke OpenAI
  const maskedNama = maskName(nama);
  const hashedNIP = nip ? hashNIP(nip) : "";
  const birthYear = tgl_lahir ? generalizeDate(tgl_lahir) : "";

  // 3. Kirim ke OpenAI dengan data yang sudah di-protect
  const response = await openai.responses.create({
    input: [{
      role: "user",
      content: `Nama: ${maskedNama}, Tahun Lahir: ${birthYear}`
      // TIDAK mengirim: nama asli, NIP asli, NIK, tanggal lahir lengkap, tempat lahir
    }]
  });

  // 4. Return dengan data asli untuk internal use
  return {
    profile_summary: {
      nama, // Data asli untuk internal
      jabatan: rest.jabatan,
    },
    insight: response.data,
    metadata: {
      security: {
        pii_protected: true,
        masked_fields: ["nama", "nip", "nik", "tgl_lahir", "tempat_lahir"]
      }
    }
  };
};
```

## Prinsip Keamanan

### 1. **Defense in Depth**
- Masking untuk visibility terbatas
- Hashing untuk anonymization
- Encryption untuk data yang perlu di-restore

### 2. **Minimize Data Exposure**
- Hanya kirim data yang benar-benar dibutuhkan AI
- Generalisasi data demografis (tahun, bukan tanggal lengkap)
- Hapus field yang tidak relevan (tempat_lahir, alamat, dll)

### 3. **Data Retention**
- Data asli tetap tersimpan di server untuk internal use
- Data yang dikirim ke AI provider minimal dan ter-anonymize
- Metadata mencatat field apa saja yang di-protect

## Field PII yang Dideteksi

```javascript
const PII_FIELDS = [
  "nama", "nip", "nik", "email", "phone", "alamat",
  "tanggal_lahir", "tempat_lahir", "foto", "ttd",
  "nama_keluarga", "nik_keluarga"
];
```

## Template-Based Approach (PALING AMAN!)

### Konsep: AI TIDAK Pernah Tahu PII User

```javascript
const { generateInsightTemplate, insightAIForParuhWaktuFromTemplate } = require('./helper/ai-insight.helper');
const { fillTemplate } = require('./ai-security/template-processor');

// STEP 1: Generate template SEKALI (simpan ke database/cache)
const { template } = await generateInsightTemplate();
// Template berisi: "Halo {{nama_depan}}, skor Anda {{skp}}"
// AI TIDAK tahu siapa "Budi" atau "Ani"!

// STEP 2: Untuk setiap user, fill template di SERVER
const insight = await insightAIForParuhWaktuFromTemplate(userProfile, template);
// Template di-fill: "Halo Budi, skor Anda 85"
// ✅ AI tidak pernah tahu nama "Budi"!
```

### Flow Comparison

#### ❌ SALAH (Old Way):
```
User Data (Budi, NIP, NIK) → AI Prompt → OpenAI Process → "Halo Budi..."
                             ↑ MELANGGAR! PII terkirim!
```

#### ✅ BENAR (Template Way):
```
Generic Prompt → OpenAI Generate Template → "Halo {{nama}}, skor {{skp}}"
                                             ↓
                                      Server Fill Template
                                             ↓
                                      "Halo Budi, skor 85"
                                      ✅ AI tidak tahu "Budi"!
```

### Keuntungan Template-Based:

1. **🔒 PII Protection**: AI TIDAK pernah tahu nama/NIP/NIK user
2. **⚡ Performance**: Template di-generate sekali, reuse untuk semua user
3. **💰 Cost Saving**: Tidak perlu call AI per user (hanya sekali untuk template)
4. **📦 Caching**: Template bisa di-cache/simpan di database
5. **🎯 Consistency**: Semua user dapat format yang konsisten

## Best Practices

### ✅ DO
- **PRIORITAS UTAMA**: Gunakan template-based approach untuk insight generation
- Selalu mask/hash PII jika terpaksa kirim ke AI (fallback only)
- Generalisasi data demografis (tahun, age group)
- Log field apa saja yang di-protect di metadata
- Simpan data asli untuk internal use
- Gunakan `security-checker` untuk validasi

### ❌ DON'T
- Jangan kirim nama lengkap ke AI
- Jangan kirim NIP/NIK asli
- Jangan kirim tanggal lahir lengkap (cukup tahun)
- Jangan kirim tempat lahir (tidak relevan untuk insight)
- Jangan kirim alamat/kontak pribadi

## Testing

### Test Template Processor
```javascript
const { fillTemplate, extractPlaceholders, validateTemplate } = require('./ai-security/template-processor');

// Test fill template
const template = "Halo {{nama}}, skor SKP Anda {{skp}}. Kekuatan: {{strength}}";
const result = fillTemplate(template, {
  nama: "Budi Santoso",
  skp: 85,
  strength: "Technical skill tinggi"
});
console.log(result);
// "Halo Budi Santoso, skor SKP Anda 85. Kekuatan: Technical skill tinggi"

// Test extract placeholders
const placeholders = extractPlaceholders(template);
console.log(placeholders);
// ["nama", "skp", "strength"]

// Test validate template
const validation = validateTemplate(template, ["nama", "skp", "strength", "unit"]);
console.log(validation);
// { isValid: false, missing: ["unit"], found: ["nama", "skp", "strength"] }
```

### Test Masking
```javascript
const { maskName, maskNIP, maskNIK } = require('./ai-security/masking');

// Test masking
const nama = "Taufiqur Rohman Suwarto";
const masked = maskName(nama);
console.log(masked); // "T******** R****** S*******"

// Test hashing
const { hashNIP } = require('./ai-security/anonymizer');
const nip = "199203012023011001";
const hashed = hashNIP(nip);
console.log(hashed); // "H_a1b2c3d4e5f6g7h8" (consistent)

// Test PII detection
const { containsPII } = require('./ai-security/security-checker');
const data = { nama: "Budi", jabatan: "Staff" };
console.log(containsPII(data));
// { hasPII: true, piiFields: ['nama'] }
```

### Test Template-Based Insight Generation
```javascript
const { generateInsightTemplate, insightAIForParuhWaktuFromTemplate } = require('./helper/ai-insight.helper');

// STEP 1: Generate template (run once)
const { template } = await generateInsightTemplate();
console.log(template.header.sapaan_hangat);
// "Halo {{nama_depan}}! 👋 Senang bisa menemani perjalanan..."

// STEP 2: Fill untuk user Budi
const budiBerkah = await insightAIForParuhWaktuFromTemplate(
  {
    nama: "Budi Santoso",
    jabatan_fungsional_umum_nama: "Analis SDM",
    unor_nama: "BKD Jawa Timur",
    // ... profile lainnya
  },
  template
);
console.log(budiBerkah.insight.header.sapaan_hangat);
// "Halo Budi! 👋 Senang bisa menemani perjalanan..."

// STEP 3: Reuse template untuk user Ani
const aniInsight = await insightAIForParuhWaktuFromTemplate(
  {
    nama: "Ani Wijaya",
    jabatan_fungsional_umum_nama: "Programmer",
    unor_nama: "Dinas Kominfo",
    // ... profile lainnya
  },
  template
);
console.log(aniInsight.insight.header.sapaan_hangat);
// "Halo Ani! 👋 Senang bisa menemani perjalanan..."

// ✅ AI TIDAK pernah tahu "Budi" atau "Ani"!
// ✅ Template hanya di-generate SEKALI
// ✅ Cost lebih murah, lebih cepat, lebih aman
```

## Environment Setup

```bash
# .env
ANONYMIZE_PEPPER="your-secret-pepper-min-32-chars"
ENCRYPTION_KEY="64-char-hex-from-generateKey-function"
OPENAI_API_KEY="sk-..."
```

## License

Internal use only - Rumah ASN BKD Jawa Timur
