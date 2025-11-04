import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI: Identifikasi nama warna dari hex code
 */
export const identifyColorName = async (hex) => {
  const prompt = `Identifikasi warna dari kode hex: ${hex}

Berikan nama warna dalam Bahasa Indonesia yang mudah dipahami.

Response JSON:
{
  "color_name": "nama warna (misal: Merah, Biru, Abu-abu, Hijau, Orange, dll)",
  "description": "deskripsi singkat (misal: merah terang, biru tua, abu-abu muda)"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Anda ahli identifikasi warna. Berikan nama warna yang sederhana dan mudah dipahami dalam Bahasa Indonesia.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content);
};

/**
 * AI: Validasi background color
 */
export const validateBackgroundColor = async (
  detectedHex,
  detectedColorName,
  requiredHex,
  requiredLabel
) => {
  const prompt = `Validasi kesesuaian warna background foto:

WARNA TERDETEKSI:
- Hex: ${detectedHex}
- Nama: ${detectedColorName}

WARNA YANG DIBUTUHKAN:
- Hex: ${requiredHex}
- Label: ${requiredLabel}

TUGAS:
Tentukan status kesesuaian background. Bersikap FLEKSIBEL dan WAJAR:
- Warna yang MIRIP (misal: abu-abu vs biru abu-abu, abu muda vs abu standar) = is_valid: true, needs_improvement: true
- Warna yang BERBEDA TOTAL (misal: merah vs abu-abu, hijau vs biru) = is_valid: false, needs_improvement: false

Response JSON:
{
  "is_valid": true/false,
  "needs_improvement": true/false,
  "reason": "penjelasan singkat dengan bahasa santai",
  "confidence": <0-100>
}

PENTING:
- Jika warna masih dalam range yang wajar (variasi abu-abu, biru muda vs biru, dll) → is_valid: true, needs_improvement: true
- Jika warna beda total → is_valid: false, needs_improvement: false
- Gunakan bahasa santai tapi jelas`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Anda validator foto yang fleksibel dan wajar. Tidak terlalu strict untuk warna yang masih dalam range mirip.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content);
};

/**
 * AI: Generate complete insight
 */
export const generateCompleteInsight = async (
  analyzeResult,
  colorIdentification,
  bgValidation,
  bgRequirement,
  wasFixed
) => {
  const prompt = `Analisis foto pegawai berdasarkan data teknis dengan bahasa santai tapi tetap mengacu pada ATURAN/KETENTUAN:

DATA ANALISIS:

1. KUALITAS FOTO:
   - Blur: ${analyzeResult.image_quality.is_blurry ? "Ya" : "Tidak"}
   - Blur Score: ${analyzeResult.image_quality.blur_score}
   - Quality Level: ${analyzeResult.image_quality.quality_level}
   - Is Acceptable: ${analyzeResult.image_quality.is_acceptable}

2. BACKGROUND:
   - Hex: ${analyzeResult.background_color.hex}
   - Nama (dari sistem): ${analyzeResult.background_color.name}
   - Nama (AI identified): ${colorIdentification.color_name}
   - Coverage: ${analyzeResult.background_color.percentage}%
   - Ketentuan jabatan: ${bgRequirement.label}
   - Valid: ${bgValidation.is_valid}
   - Needs improvement: ${bgValidation.needs_improvement || false}
   - Reason: ${bgValidation.reason}
   - Sudah diperbaiki: ${wasFixed}

3. PAKAIAN/SERAGAM:
   - Detected: ${analyzeResult.clothing.detected}
   - Type: ${analyzeResult.clothing.type}
   - Khaki PNS: ${analyzeResult.khaki_pns.is_khaki_pns}
   - Confidence: ${analyzeResult.khaki_pns.confidence}%
   - Reason: ${analyzeResult.khaki_pns.reason}

ATURAN YANG HARUS KAMU FOLLOW:

1. BACKGROUND:
   - WAJIB mengacu ke KETENTUAN JABATAN (${bgRequirement.label})
   - Jangan bahas soal estetika (cantik/bagus/menarik)
   - Fokus ke: "sesuai aturan" atau "perlu disesuaikan dengan ketentuan"
   - Contoh: "Berdasarkan ketentuan jabatan, background harus ${
     bgRequirement.label
   }"

2. BLUR/KUALITAS:
   - Boleh bahas estetika dan teknis
   - Kasih tips praktis cara foto yang tidak blur
   - Contoh: "Foto kamu udah tajam nih" atau "Agak blur, coba foto di tempat terang"

3. KHAKI/SERAGAM:
   - Fokus ke ATURAN SERAGAM PNS
   - Jangan bahas estetika
   - Contoh: "Sesuai ketentuan, PNS wajib pakai khaki"

GAYA BAHASA:
- Santai tapi profesional (pakai: "kamu", "nih", "yuk", "coba deh")
- Tetap merujuk ke aturan/ketentuan resmi
- Jangan terlalu formal tapi juga jangan alay

Response JSON:
{
  "score": <0-100, prioritaskan kesesuaian dengan ATURAN>,
  "ringkasan": "kesimpulan 1-2 kalimat tentang keseluruhan foto",
  "detail": {
    "kualitas_foto": "penjelasan tentang blur/kualitas (boleh estetik)",
    "background": "penjelasan tentang background BERDASARKAN KETENTUAN JABATAN",
    "seragam": "penjelasan tentang khaki/seragam BERDASARKAN ATURAN PNS"
  },
  "status_kepatuhan": "apakah foto sudah sesuai semua aturan atau belum",
  "perubahan": "jika ada yang diperbaiki, jelaskan. Kalau tidak ada isi null",
  "rekomendasi": [
    "rekomendasi terkait KETENTUAN (bukan estetika)",
    "rekomendasi terkait KETENTUAN",
    "tips praktis kalau ada masalah teknis"
  ]
}

CONTOH YANG BENAR:
❌ JANGAN: "Background biru abu-abu kurang menarik, pakai yang lebih cerah"
✅ PAKAI: "Berdasarkan ketentuan jabatan, background harus ${
    bgRequirement.label
  }. Background kamu ${
    colorIdentification.color_name
  }, udah mirip sih tapi beda tone dikit"

❌ JANGAN: "Background polos biar lebih profesional"
✅ PAKAI: "Sesuai aturan foto resmi PNS, background harus ${
    bgRequirement.label
  }"

❌ JANGAN: "Pakai seragam khaki biar kelihatan rapi"
✅ PAKAI: "Berdasarkan ketentuan, PNS wajib pakai seragam khaki. Foto kamu udah sesuai nih!"`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Kamu adalah AI checker foto resmi PNS yang memberikan feedback berdasarkan ATURAN dan KETENTUAN resmi, bukan estetika. Gunakan bahasa santai tapi selalu rujuk ke peraturan yang berlaku.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content);
};
