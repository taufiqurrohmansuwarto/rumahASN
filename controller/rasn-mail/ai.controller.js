const OpenAI = require("openai");
const { handleError } = require("@/utils/helper/controller-helper");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Text Refine - Memperhalus/memperbaiki teks pesan
 * Seperti fitur Apple Intelligence untuk writing
 */
const refineText = async (req, res) => {
  try {
    const { text, mode = "professional" } = req?.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Teks tidak boleh kosong",
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Teks terlalu panjang (maksimal 5000 karakter)",
      });
    }

    // Mode configuration
    const modeConfig = {
      professional: {
        instruction:
          "Ubah teks menjadi lebih profesional, sopan, dan formal namun tetap ramah. Gunakan bahasa Indonesia yang baik dan benar.",
        example: "Pesan yang sopan dan profesional untuk lingkungan kerja",
      },
      friendly: {
        instruction:
          "Ubah teks menjadi lebih ramah dan bersahabat, tetapi tetap sopan. Gunakan bahasa yang hangat namun profesional.",
        example: "Pesan yang hangat dan bersahabat",
      },
      concise: {
        instruction:
          "Ringkas teks menjadi lebih singkat dan padat tanpa menghilangkan makna penting. Langsung ke poin utama.",
        example: "Pesan yang singkat dan to the point",
      },
      detailed: {
        instruction:
          "Perluas dan jelaskan teks dengan lebih detail. Tambahkan penjelasan yang relevan agar lebih jelas dan mudah dipahami.",
        example: "Pesan yang lebih lengkap dan detail",
      },
      surat_dinas: {
        instruction: `Ubah teks menjadi format surat dinas resmi pemerintah Indonesia dengan struktur yang benar.
        
FORMAT SURAT DINAS:
- Gunakan bahasa formal kedinasan
- Struktur: Salam pembuka → Isi → Penutup → Salam hormat
- Gunakan kata-kata baku: "Dengan hormat,", "Demikian kami sampaikan", "Atas perhatian dan kerjasamanya, kami ucapkan terima kasih"
- Hindari kata-kata informal
- Gunakan "kami" bukan "saya" jika mewakili instansi
- Referensi peraturan jika relevan
- Cantumkan maksud dan tujuan dengan jelas`,
        example: "Surat dinas resmi dengan format pemerintahan",
      },
    };

    const config = modeConfig[mode] || modeConfig.professional;

    const prompt = `Kamu adalah asisten penulisan profesional untuk ASN (Aparatur Sipil Negara) di Indonesia.

TUGAS: ${config.instruction}

ATURAN PENTING:
1. Pertahankan maksud dan informasi asli dari pesan
2. Jika ada kata-kata kasar/tidak sopan, ganti dengan kata yang lebih halus
3. Perbaiki tata bahasa dan ejaan jika ada yang salah
4. Gunakan Bahasa Indonesia yang baik dan benar
5. Jangan tambahkan informasi baru yang tidak ada di teks asli
6. Jangan ubah nama, tanggal, angka, atau data spesifik
7. Hasil akhir harus natural dan tidak kaku

TEKS ASLI:
${text}

Berikan HANYA teks hasil perbaikan tanpa penjelasan tambahan. Jangan gunakan markdown atau format khusus kecuali yang sudah ada di teks asli.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah asisten penulisan yang membantu memperhalus pesan. Berikan hanya hasil perbaikan tanpa penjelasan.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const refinedText = completion.choices[0]?.message?.content?.trim() || "";

    if (!refinedText) {
      return res.status(500).json({
        success: false,
        message: "Gagal memproses teks",
      });
    }

    res.json({
      success: true,
      data: {
        original: text,
        refined: refinedText,
        mode,
        tokens_used: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error("AI Refine Text Error:", error);
    handleError(res, error);
  }
};

/**
 * Check Typo - Memeriksa kesalahan ejaan dan typo
 */
const checkTypo = async (req, res) => {
  try {
    const { text } = req?.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Teks tidak boleh kosong",
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Teks terlalu panjang (maksimal 5000 karakter)",
      });
    }

    const prompt = `Kamu adalah pemeriksa ejaan bahasa Indonesia yang teliti.

TUGAS: Periksa teks berikut dan temukan semua kesalahan ejaan, typo, atau kata yang salah.

TEKS:
${text}

BERIKAN OUTPUT DALAM FORMAT JSON BERIKUT:
{
  "hasErrors": true/false,
  "errors": [
    {
      "word": "kata yang salah",
      "suggestion": "saran perbaikan",
      "position": "posisi kata dalam teks (kira-kira)",
      "type": "typo" atau "ejaan" atau "tata_bahasa"
    }
  ],
  "correctedText": "teks lengkap yang sudah diperbaiki",
  "summary": "ringkasan singkat tentang kesalahan yang ditemukan"
}

Jika tidak ada kesalahan, set hasErrors ke false dan errors ke array kosong.
PENTING: Berikan HANYA JSON valid tanpa penjelasan tambahan.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah pemeriksa ejaan bahasa Indonesia. Berikan output dalam format JSON yang valid.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseText =
      completion.choices[0]?.message?.content?.trim() || "{}";

    // Parse JSON response
    let result;
    try {
      // Remove markdown code blocks if present
      const cleanJson = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(cleanJson);
    } catch {
      // Fallback if JSON parsing fails
      result = {
        hasErrors: false,
        errors: [],
        correctedText: text,
        summary: "Tidak dapat memproses pemeriksaan ejaan",
      };
    }

    res.json({
      success: true,
      data: {
        original: text,
        ...result,
        tokens_used: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error("AI Check Typo Error:", error);
    handleError(res, error);
  }
};

/**
 * Generate Template - Generate template surat berdasarkan jenis
 */
const generateTemplate = async (req, res) => {
  try {
    const { templateType, context = {} } = req?.body;

    if (!templateType) {
      return res.status(400).json({
        success: false,
        message: "Jenis template tidak boleh kosong",
      });
    }

    // Template configurations
    const templates = {
      izin_tidak_masuk: {
        name: "Izin Tidak Masuk Kerja",
        instruction: `Buat surat izin tidak masuk kerja untuk ASN dengan format berikut:
- Salam pembuka formal
- Alasan tidak masuk (sakit/keperluan keluarga/lainnya)
- Tanggal tidak masuk
- Permohonan izin yang sopan
- Salam penutup`,
        placeholders: ["[ALASAN]", "[TANGGAL]", "[ATASAN]"],
      },
      permohonan_data: {
        name: "Permohonan Data",
        instruction: `Buat surat permohonan data dengan format berikut:
- Salam pembuka formal
- Identitas pemohon dan instansi
- Data yang diminta secara spesifik
- Tujuan penggunaan data
- Ucapan terima kasih
- Salam penutup`,
        placeholders: ["[JENIS_DATA]", "[TUJUAN]", "[INSTANSI_TUJUAN]"],
      },
      undangan_rapat: {
        name: "Undangan Rapat",
        instruction: `Buat undangan rapat resmi dengan format berikut:
- Judul undangan
- Hari/tanggal pelaksanaan
- Waktu mulai
- Tempat/lokasi (bisa virtual)
- Agenda rapat
- Permintaan konfirmasi kehadiran
- Salam penutup`,
        placeholders: [
          "[AGENDA]",
          "[HARI_TANGGAL]",
          "[WAKTU]",
          "[TEMPAT]",
          "[PESERTA]",
        ],
      },
      pemberitahuan_deadline: {
        name: "Pemberitahuan Deadline",
        instruction: `Buat pemberitahuan deadline dengan format berikut:
- Salam pembuka
- Hal yang perlu diselesaikan
- Deadline/batas waktu
- Konsekuensi jika terlewat (jika ada)
- Himbauan untuk segera menyelesaikan
- Salam penutup`,
        placeholders: ["[HAL_TUGAS]", "[DEADLINE]", "[PENERIMA]"],
      },
      ucapan_terima_kasih: {
        name: "Ucapan Terima Kasih",
        instruction: `Buat ucapan terima kasih formal dengan format berikut:
- Salam pembuka
- Menyebutkan konteks/bantuan yang diberikan
- Ungkapan terima kasih yang tulus
- Harapan kerjasama kedepan
- Salam penutup`,
        placeholders: ["[KONTEKS_BANTUAN]", "[PENERIMA]"],
      },
      follow_up_tugas: {
        name: "Follow Up Tugas",
        instruction: `Buat pesan follow up tugas dengan format berikut:
- Salam pembuka sopan
- Reminder tentang tugas/pekerjaan yang ditunggu
- Tanggal deadline asli (jika ada)
- Permintaan update status
- Tawarkan bantuan jika diperlukan
- Salam penutup`,
        placeholders: ["[TUGAS]", "[DEADLINE]", "[PENERIMA]"],
      },
    };

    const template = templates[templateType];

    if (!template) {
      return res.status(400).json({
        success: false,
        message: "Jenis template tidak valid",
        availableTemplates: Object.keys(templates).map((key) => ({
          key,
          name: templates[key].name,
        })),
      });
    }

    const contextInfo = Object.entries(context)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const prompt = `Kamu adalah asisten penulisan untuk ASN (Aparatur Sipil Negara) di Indonesia.

TUGAS: ${template.instruction}

${contextInfo ? `KONTEKS:\n${contextInfo}\n` : ""}

ATURAN:
1. Gunakan bahasa Indonesia formal kedinasan
2. Buat template yang bisa langsung digunakan
3. Gunakan placeholder dalam kurung siku [...] untuk bagian yang perlu diisi user
4. Jangan terlalu panjang, cukup to the point
5. Format yang rapi dan mudah dibaca

Berikan HANYA template surat tanpa penjelasan tambahan.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah asisten penulisan yang membuat template surat dinas. Berikan hanya template tanpa penjelasan.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const generatedTemplate =
      completion.choices[0]?.message?.content?.trim() || "";

    if (!generatedTemplate) {
      return res.status(500).json({
        success: false,
        message: "Gagal membuat template",
      });
    }

    res.json({
      success: true,
      data: {
        templateType,
        templateName: template.name,
        content: generatedTemplate,
        placeholders: template.placeholders,
        tokens_used: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error("AI Generate Template Error:", error);
    handleError(res, error);
  }
};

/**
 * Get Available Templates - Daftar template yang tersedia
 */
const getTemplates = async (req, res) => {
  try {
    const templates = [
      {
        key: "izin_tidak_masuk",
        name: "Izin Tidak Masuk Kerja",
        icon: "🏥",
        description: "Surat izin sakit atau tidak masuk kerja",
      },
      {
        key: "permohonan_data",
        name: "Permohonan Data",
        icon: "📊",
        description: "Meminta data dari instansi lain",
      },
      {
        key: "undangan_rapat",
        name: "Undangan Rapat",
        icon: "📅",
        description: "Undangan rapat atau pertemuan resmi",
      },
      {
        key: "pemberitahuan_deadline",
        name: "Pemberitahuan Deadline",
        icon: "⏰",
        description: "Mengingatkan batas waktu penyelesaian",
      },
      {
        key: "ucapan_terima_kasih",
        name: "Ucapan Terima Kasih",
        icon: "🙏",
        description: "Menyampaikan terima kasih formal",
      },
      {
        key: "follow_up_tugas",
        name: "Follow Up Tugas",
        icon: "📝",
        description: "Menanyakan progress tugas/pekerjaan",
      },
    ];

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Get Templates Error:", error);
    handleError(res, error);
  }
};

module.exports = {
  refineText,
  checkTypo,
  generateTemplate,
  getTemplates,
};
