// services/openai.service.js
import OpenAI from "openai";

const { log } = require("@/utils/logger");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Preprocess text for consistent embedding
 * - Normalize whitespace and special characters
 * - Preserve important acronyms (MFA, ASN, PNS, etc.)
 * - Lowercase for consistency
 */
const preprocessText = (text) => {
  if (!text || typeof text !== "string") return "";

  // Common acronyms to preserve (uppercase)
  const acronyms = [
    "MFA",
    "ASN",
    "PNS",
    "PPPK",
    "BKD",
    "BKN",
    "NIP",
    "NIK",
    "SIASN",
    "CASN",
    "CPNS",
  ];

  // Step 1: Trim and normalize spacing
  let processed = text.trim().replace(/\s+/g, " ");

  // Step 2: Create a map to preserve acronyms
  const acronymMap = {};
  acronyms.forEach((acronym) => {
    const placeholder = `__${acronym}__`;
    const regex = new RegExp(`\\b${acronym}\\b`, "gi");
    if (regex.test(processed)) {
      acronymMap[placeholder] = acronym;
      processed = processed.replace(regex, placeholder);
    }
  });

  // Step 3: Lowercase
  processed = processed.toLowerCase();

  // Step 4: Restore acronyms
  Object.keys(acronymMap).forEach((placeholder) => {
    processed = processed.replace(
      new RegExp(placeholder, "g"),
      acronymMap[placeholder]
    );
  });

  // Step 5: Remove excessive punctuation but keep meaningful ones
  processed = processed.replace(/([?.!,;:]){2,}/g, "$1");

  // Step 6: Normalize quotes
  processed = processed.replace(/[""]/g, '"').replace(/['']/g, "'");

  log.debug("Text preprocessed:", {
    original: text.substring(0, 50) + "...",
    processed: processed.substring(0, 50) + "...",
  });

  return processed;
};

// Generate embedding
export const generateEmbedding = async (text) => {
  try {
    // Preprocess text for consistent embeddings
    const processedText = preprocessText(text);

    if (!processedText) {
      return {
        success: false,
        error: "Text is empty after preprocessing",
      };
    }

    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: processedText,
      dimensions: 3072,
    });
    return {
      success: true,
      data: response.data[0].embedding,
    };
  } catch (error) {
    log.error("OpenAI embedding error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Generate answer from context (RAG)
export const generateAnswer = async (query, contextQnA) => {
  try {
    if (contextQnA.length === 0) {
      return {
        success: true,
        data: "Maaf, tidak ada informasi yang relevan untuk menjawab pertanyaan Anda.",
      };
    }

    const context = contextQnA
      .map((q, idx) => {
        // Format dates
        const formatDate = (dateStr) => {
          if (!dateStr) return null;
          const date = new Date(dateStr);
          return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        };

        const effectiveDate = formatDate(q.effective_date);
        const expiredDate = formatDate(q.expired_date);

        const validInfo =
          effectiveDate && expiredDate
            ? `(Berlaku: ${effectiveDate} s/d ${expiredDate})`
            : effectiveDate
            ? `(Berlaku sejak: ${effectiveDate})`
            : "";

        // Get sub-category names
        const categories =
          q.sub_categories && q.sub_categories.length > 0
            ? q.sub_categories.map((sc) => sc.name).join(", ")
            : "";

        const categoryInfo = categories ? `Kategori: ${categories}` : "";

        // Add similarity score to context
        const similarityScore = q.similarity
          ? `Skor Relevansi: ${(q.similarity * 100).toFixed(1)}%`
          : "";
        const similarityLevel = q.similarity_level
          ? `(${
              q.similarity_level === "high" ? "Sangat Relevan" : "Cukup Relevan"
            })`
          : "";

        return `[${idx + 1}] ${similarityScore} ${similarityLevel}
Pertanyaan: ${q.question}
Jawaban: ${q.answer}
${validInfo}
${categoryInfo}
Referensi: ${q.regulation_ref || "-"}`;
      })
      .join("\n\n---\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Kamu adalah asisten AI BKD Jawa Timur yang membantu menjawab pertanyaan seputar kepegawaian ASN.

INSTRUKSI PENTING:
1. HANYA jawab berdasarkan knowledge base yang diberikan - JANGAN membuat informasi baru
2. Prioritaskan sumber dengan Skor Relevansi tertinggi (>70% = Sangat Relevan)
3. Jika skor relevansi <70%, sebut "informasi ini mungkin kurang sesuai dengan pertanyaan Anda"
4. Perhatikan tanggal berlaku - informasi yang sudah kadaluarsa harus disebutkan
5. Sebutkan referensi regulasi jika tersedia
6. Jika tidak ada informasi yang relevan, katakan dengan jelas dan sarankan untuk menghubungi bagian terkait
7. Gunakan bahasa Indonesia formal tapi ramah
8. Jangan mengarang atau mengira-ngira jawaban
9. Struktur jawaban: langsung ke inti, tidak bertele-tele

FORMAT JAWABAN:
- Paragraf 1: Jawaban langsung (berdasarkan FAQ dengan skor tertinggi)
- Paragraf 2 (opsional): Informasi tambahan dari sumber lain
- Paragraf 3 (opsional): Referensi dan kontak untuk informasi lebih lanjut`,
        },
        {
          role: "user",
          content: `Knowledge Base (diurutkan berdasarkan relevansi):\n\n${context}\n\nPertanyaan User: ${query}\n\nJawab berdasarkan knowledge base di atas. Fokus pada sumber dengan skor relevansi tertinggi:`,
        },
      ],
      temperature: 0.3, // Lower temperature for more focused, consistent answers
      max_tokens: 1000, // Slightly higher for detailed answers
    });

    return {
      success: true,
      data: response.choices[0].message.content,
    };
  } catch (error) {
    log.error("OpenAI completion error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Generate summary
export const generateSummary = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Buat ringkasan singkat dalam 1-2 kalimat.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    return {
      success: true,
      data: response.choices[0].message.content,
    };
  } catch (error) {
    log.error("OpenAI summary error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};
