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
    log.info("🤖 generateAnswer called:", {
      query,
      contextCount: contextQnA?.length || 0,
    });

    if (contextQnA.length === 0) {
      log.warn("No context provided for answer generation");
      return {
        success: true,
        data: "Maaf, kami belum memiliki informasi yang relevan untuk pertanyaan Anda. Tenang, pertanyaan Anda akan segera dijawab oleh tim BKD kami.",
      };
    }

    // Check validity status of FAQs
    const now = new Date();
    const validityStatus = contextQnA.map((q) => {
      const isExpired =
        q.expired_date && new Date(q.expired_date) < now ? true : false;
      const isNotYetEffective =
        q.effective_date && new Date(q.effective_date) > now ? true : false;

      return {
        id: q.id,
        similarity: q.similarity?.toFixed(3),
        status: isExpired
          ? "KADALUARSA"
          : isNotYetEffective
          ? "BELUM_BERLAKU"
          : "BERLAKU",
      };
    });

    log.debug("Context FAQs with validity:", validityStatus);

    const expiredCount = validityStatus.filter(
      (v) => v.status === "KADALUARSA"
    ).length;
    if (expiredCount > 0) {
      log.warn(`⚠️ ${expiredCount} FAQ(s) are EXPIRED in context`);
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

        // Check if expired
        const now = new Date();
        const isExpired =
          q.expired_date && new Date(q.expired_date) < now ? true : false;
        const isNotYetEffective =
          q.effective_date && new Date(q.effective_date) > now ? true : false;

        // Build validity info with status indicators
        let validInfo = "";
        if (isExpired) {
          validInfo = `⚠️ KADALUARSA (Berlaku: ${effectiveDate} s/d ${expiredDate}) - Informasi ini sudah tidak berlaku`;
        } else if (isNotYetEffective) {
          validInfo = `⏳ BELUM BERLAKU (Akan berlaku mulai: ${effectiveDate})`;
        } else if (effectiveDate && expiredDate) {
          validInfo = `✅ MASIH BERLAKU (${effectiveDate} s/d ${expiredDate})`;
        } else if (effectiveDate) {
          validInfo = `✅ BERLAKU SEJAK: ${effectiveDate}`;
        }

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

    log.debug("Context built:", {
      contextLength: context.length,
      contextPreview: context.substring(0, 200) + "...",
    });

    log.info("Calling OpenAI GPT-4o-mini...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Kamu adalah bestieAI BKD Jawa Timur, temen setia yang humble dan siap ngebantu jawab pertanyaan seputar kepegawaian ASN dengan info yang akurat dan helpful!

INSTRUKSI PENTING:
1. HANYA jawab berdasarkan knowledge base yang diberikan - JANGAN membuat informasi baru
2. Prioritaskan sumber dengan Skor Relevansi tertinggi (>70% = Sangat Relevan)
3. Jika skor relevansi <70%, sebut "informasi ini mungkin kurang sesuai dengan pertanyaan Anda"
4. PERHATIKAN STATUS BERLAKU dengan SANGAT TELITI:
   - ⚠️ KADALUARSA: JANGAN gunakan sebagai jawaban utama, WAJIB sebutkan bahwa informasi sudah tidak berlaku
   - ⏳ BELUM BERLAKU: Sebutkan kapan akan mulai berlaku
   - ✅ MASIH BERLAKU: Prioritaskan ini untuk jawaban
5. Sebutkan referensi regulasi jika tersedia
6. Jika tidak ada informasi yang relevan, katakan dengan jelas dan sarankan untuk menghubungi bagian terkait
7. Gunakan bahasa Indonesia formal tapi ramah
8. Jangan mengarang atau mengira-ngira jawaban
9. OUTPUT HARUS DALAM FORMAT MARKDOWN yang rapi dan terstruktur

FORMAT MARKDOWN:
- Gunakan **bold** untuk poin penting
- Gunakan *italic* untuk emphasis
- Gunakan numbered list (1., 2., 3.) untuk langkah-langkah
- Gunakan bullet points (-, *) untuk daftar items
- Gunakan > blockquote untuk catatan penting atau warning
- Gunakan \`code\` untuk nama aplikasi/sistem
- Pisahkan section dengan line break yang cukup

STRUKTUR JAWABAN:
1. **Jawaban Utama**: Langsung ke inti (PRIORITASKAN sumber ✅ MASIH BERLAKU dengan skor tertinggi)
2. **Detail/Langkah** (jika ada): Gunakan numbered list atau bullet points
3. **Catatan Penting** (jika ada): Gunakan blockquote dengan > 
4. **Referensi** (jika ada): Sebutkan regulasi dengan format rapi
5. **WAJIB**: Jika ada ⚠️ KADALUARSA, buat warning box dengan > dan **bold**

CONTOH FORMAT:
**Jawaban singkat dan langsung**

Penjelasan detail dengan formatting yang jelas:
1. Langkah pertama
2. Langkah kedua
3. Langkah ketiga

> **Catatan Penting**: Gunakan blockquote untuk hal-hal penting

*Referensi: PP No. XX Tahun XXXX*`,
        },
        {
          role: "user",
          content: `Knowledge Base (diurutkan berdasarkan relevansi):\n\n${context}\n\nPertanyaan User: ${query}\n\nJawab berdasarkan knowledge base di atas. Fokus pada sumber dengan skor relevansi tertinggi:`,
        },
      ],
      temperature: 0.3, // Lower temperature for more focused, consistent answers
      max_tokens: 1000, // Slightly higher for detailed answers
    });

    const answer = response.choices[0].message.content;

    log.info("✅ OpenAI response received:", {
      answerLength: answer?.length || 0,
      model: response.model,
      tokensUsed: response.usage?.total_tokens || 0,
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
    });

    log.debug("Answer preview:", {
      preview: answer?.substring(0, 150) + "...",
    });

    return {
      success: true,
      data: answer,
    };
  } catch (error) {
    log.error("❌ OpenAI completion error:", {
      message: error.message,
      type: error.type,
      code: error.code,
      status: error.status,
    });
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
