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

module.exports = {
  refineText,
};

