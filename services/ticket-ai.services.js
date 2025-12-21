/**
 * Ticket AI Services
 * Shared service untuk AI processing ticket (summary + recommendation)
 * MIMIC logic yang sama persis dengan /api/ref/faq-qna/ask
 *
 * Menggunakan CommonJS + Axios agar compatible dengan Node.js 16 worker
 */

const axios = require("axios");
const { QdrantClient } = require("@qdrant/js-client-rest");
const FaqQna = require("@/models/faq-qna.model");

// ========================================
// CONFIGURATION
// ========================================
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = "https://api.openai.com/v1";

const QDRANT_HOST = process.env.QDRANT_HOST || "localhost";
const QDRANT_PORT = process.env.QDRANT_PORT || 6333;
const QDRANT_URL = `http://${QDRANT_HOST}:${QDRANT_PORT}`;
const COLLECTION_NAME = "qna_embeddings";
const QDRANT_ENABLED = process.env.QDRANT_ENABLED === "true";
const SEARCH_STRATEGY = process.env.SEARCH_STRATEGY || "hybrid";

// RAG Quality Settings (sama dengan search.services.js)
const SIMILARITY_THRESHOLD = parseFloat(
  process.env.SIMILARITY_THRESHOLD || "0.5"
);
const SIMILARITY_THRESHOLD_HIGH = parseFloat(
  process.env.SIMILARITY_THRESHOLD_HIGH || "0.7"
);
const MAX_CONTEXT_ITEMS = parseInt(process.env.MAX_CONTEXT_ITEMS || "3");

// Initialize Qdrant client only
let qdrantClient = null;

const getQdrantClient = () => {
  if (!qdrantClient) {
    qdrantClient = new QdrantClient({ url: QDRANT_URL });
  }
  return qdrantClient;
};

// ========================================
// AXIOS: OpenAI API calls (Node.js 16 compatible)
// ========================================
const openaiRequest = async (endpoint, data, timeout = 60000) => {
  const response = await axios.post(`${OPENAI_BASE_URL}${endpoint}`, data, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    timeout,
  });
  return response.data;
};

// ========================================
// OPENAI: Generate Embedding (via Axios)
// ========================================
const generateEmbedding = async (text) => {
  try {
    // Preprocess text
    const processedText = text.trim().replace(/\s+/g, " ").toLowerCase();

    if (!processedText) {
      return { success: false, error: "Text is empty" };
    }

    const response = await openaiRequest("/embeddings", {
      model: "text-embedding-3-large",
      input: processedText,
      dimensions: 3072,
    });

    return {
      success: true,
      data: response.data[0].embedding,
    };
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error("❌ [TICKET-AI] Embedding error:", errMsg);
    return { success: false, error: errMsg };
  }
};

// ========================================
// OPENAI: Generate Summary (via Axios)
// ========================================
const generateSummary = async (text) => {
  try {
    const response = await openaiRequest("/chat/completions", {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Ringkas laporan berikut menjadi 1–2 kalimat yang menjelaskan inti masalah pelapor secara formal dan mudah dipahami. Jangan menyimpulkan di luar isi.",
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
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error("❌ [TICKET-AI] Summary error:", errMsg);
    return { success: false, error: errMsg };
  }
};

// ========================================
// OPENAI: Generate Answer (via Axios - sama persis dengan open-ai.services.js)
// ========================================
const generateAnswer = async (query, contextQnA) => {
  try {
    if (!contextQnA || contextQnA.length === 0) {
      return {
        success: true,
        data: "Maaf, kami belum memiliki informasi yang relevan untuk pertanyaan Anda. Tenang, pertanyaan Anda akan segera dijawab oleh tim BKD kami.",
      };
    }

    const now = new Date();

    // Build context dari FAQ (sama persis dengan open-ai.services.js)
    const context = contextQnA
      .map((q, idx) => {
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

        const isExpired =
          q.expired_date && new Date(q.expired_date) < now ? true : false;
        const isNotYetEffective =
          q.effective_date && new Date(q.effective_date) > now ? true : false;

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

        const categories =
          q.sub_categories && q.sub_categories.length > 0
            ? q.sub_categories.map((sc) => sc.name).join(", ")
            : "";

        const categoryInfo = categories ? `Kategori: ${categories}` : "";

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

    const response = await openaiRequest("/chat/completions", {
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
5. **WAJIB**: Jika ada ⚠️ KADALUARSA, buat warning box dengan > dan **bold**`,
        },
        {
          role: "user",
          content: `Knowledge Base (diurutkan berdasarkan relevansi):\n\n${context}\n\nPertanyaan User: ${query}\n\nJawab berdasarkan knowledge base di atas. Fokus pada sumber dengan skor relevansi tertinggi:`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    return {
      success: true,
      data: response.choices[0].message.content,
    };
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error("❌ [TICKET-AI] Answer error:", errMsg);
    return { success: false, error: errMsg };
  }
};

// ========================================
// QDRANT: Search Similar
// ========================================
const searchWithQdrant = async (
  query,
  subCategoryIds = [],
  limit = 5,
  referenceDate = new Date()
) => {
  try {
    console.log("🔍 [TICKET-AI] Qdrant search starting...");

    // Generate embedding
    const embeddingResult = await generateEmbedding(query);
    if (!embeddingResult.success) {
      throw new Error(embeddingResult.error);
    }

    const client = getQdrantClient();

    // Build filters
    const must = [];

    if (subCategoryIds && subCategoryIds.length > 0) {
      must.push({
        key: "sub_category_ids",
        match: { any: subCategoryIds },
      });
    }

    must.push({
      key: "is_active",
      match: { value: true },
    });

    const searchParams = {
      vector: embeddingResult.data,
      limit: limit * 2,
      with_payload: true,
    };

    if (must.length > 0) {
      searchParams.filter = { must };
    }

    const searchResult = await client.search(COLLECTION_NAME, searchParams);

    // Log similarity scores dari Qdrant
    const qdrantScores = searchResult.map((r) => ({
      id: r.payload?.qna_id,
      score: r.score?.toFixed(3),
    }));
    console.log(
      `✅ [TICKET-AI] Qdrant returned ${searchResult.length} results:`,
      qdrantScores
    );

    if (searchResult.length === 0) {
      return { success: true, data: [] };
    }

    // Get QNA IDs
    const qnaIds = searchResult
      .map((r) => r.payload?.qna_id)
      .filter((id) => id !== undefined && id !== null);

    if (qnaIds.length === 0) {
      console.log("⚠️ [TICKET-AI] No valid qna_ids in Qdrant results");
      return { success: true, data: [] };
    }

    // Fetch full data from PostgreSQL
    const qnaData = await FaqQna.query()
      .whereIn("id", qnaIds)
      .where("is_active", true)
      .where("effective_date", "<=", referenceDate)
      .where(function () {
        this.whereNull("expired_date").orWhere(
          "expired_date",
          ">",
          referenceDate
        );
      })
      .withGraphFetched("sub_categories.[category]");

    console.log(
      `📊 [TICKET-AI] PostgreSQL returned ${qnaData.length} valid FAQs (from ${qnaIds.length} Qdrant IDs)`
    );

    // Merge with similarity scores
    const results = qnaData
      .map((qna) => {
        const vector = searchResult.find((v) => v.payload?.qna_id === qna.id);
        const similarity = vector ? vector.score : 0;

        return {
          ...qna,
          similarity,
          similarity_level:
            similarity >= SIMILARITY_THRESHOLD_HIGH ? "high" : "medium",
          search_method: "vector",
        };
      })
      .filter((qna) => {
        const passed = qna.similarity >= SIMILARITY_THRESHOLD;
        if (!passed) {
          console.log(
            `⚠️ [TICKET-AI] FAQ ${
              qna.id
            } filtered out: similarity ${qna.similarity?.toFixed(
              3
            )} < threshold ${SIMILARITY_THRESHOLD}`
          );
        }
        return passed;
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, MAX_CONTEXT_ITEMS);

    console.log(
      `📊 [TICKET-AI] After similarity filter: ${results.length} FAQs passed threshold ${SIMILARITY_THRESHOLD}`
    );

    return { success: true, data: results };
  } catch (error) {
    console.error("❌ [TICKET-AI] Qdrant search error:", error.message);
    return { success: false, error: error.message, data: [] };
  }
};

// ========================================
// FULLTEXT: Search with PostgreSQL
// ========================================
const searchWithFullText = async (query, subCategoryIds = [], limit = 5) => {
  try {
    console.log("🔍 [TICKET-AI] Fulltext search starting...");

    const results = await FaqQna.fullTextSearch(query, subCategoryIds, limit);

    return {
      success: true,
      data: results.map((qna) => ({
        ...qna,
        similarity: qna.rank || 0.5,
        similarity_level: "medium",
        search_method: "fulltext",
      })),
    };
  } catch (error) {
    console.error("❌ [TICKET-AI] Fulltext search error:", error.message);
    return { success: false, error: error.message, data: [] };
  }
};

// ========================================
// KEYWORD: Fallback search
// PENTING: Untuk ticket recommendation, jangan gunakan keyword search
// karena tidak bisa memberikan similarity score yang akurat
// ========================================
const searchWithKeyword = async (query, subCategoryIds = [], limit = 5) => {
  try {
    console.log("🔍 [TICKET-AI] Keyword search starting...");

    const keywords = query
      .toLowerCase()
      .split(" ")
      .filter((k) => k.length > 2);

    // Jika tidak ada sub_category_id, jangan search sama sekali
    // karena akan terlalu banyak hasil yang tidak relevan
    if (!subCategoryIds || subCategoryIds.length === 0) {
      console.log(
        "⚠️ [TICKET-AI] Keyword search skipped: no sub_category filter"
      );
      return { success: true, data: [] };
    }

    let qb = FaqQna.query()
      .where("is_active", true)
      .where("effective_date", "<=", new Date())
      .where(function () {
        this.whereNull("expired_date").orWhere("expired_date", ">", new Date());
      })
      .withGraphFetched("sub_categories.[category]")
      .limit(limit);

    if (keywords.length > 0) {
      qb = qb.where(function () {
        keywords.forEach((keyword) => {
          this.orWhereRaw("LOWER(question) LIKE ?", [
            `%${keyword}%`,
          ]).orWhereRaw("LOWER(answer) LIKE ?", [`%${keyword}%`]);
        });
      });
    }

    // WAJIB filter by sub_category
    qb = qb
      .joinRelated("sub_categories")
      .whereIn("sub_categories.id", subCategoryIds);

    const results = await qb;

    // Keyword search tidak bisa memberikan similarity yang akurat
    // Jadi kita set similarity rendah (0.4) agar tidak selalu lolos threshold
    // Hasil keyword hanya digunakan jika benar-benar match sub_category
    return {
      success: true,
      data: results.map((qna) => ({
        ...qna,
        similarity: 0.4, // Dibawah threshold 0.5 - tidak akan lolos!
        similarity_level: "low",
        search_method: "keyword",
      })),
    };
  } catch (error) {
    console.error("❌ [TICKET-AI] Keyword search error:", error.message);
    return { success: false, error: error.message, data: [] };
  }
};

// ========================================
// SMART SEARCH: Sama persis dengan search.services.js
// ========================================
const smartSearch = async (
  query,
  subCategoryIds = [],
  limit = 5,
  referenceDate = new Date()
) => {
  try {
    console.log("🔍 [TICKET-AI] Smart search:", {
      query: query.substring(0, 50) + "...",
      subCategoryIds,
      strategy: SEARCH_STRATEGY,
      qdrantEnabled: QDRANT_ENABLED,
    });

    // Strategy 1: Try Qdrant
    if (
      QDRANT_ENABLED &&
      (SEARCH_STRATEGY === "qdrant" || SEARCH_STRATEGY === "hybrid")
    ) {
      try {
        const result = await searchWithQdrant(
          query,
          subCategoryIds,
          limit,
          referenceDate
        );
        if (result.success && result.data.length > 0) {
          console.log(
            `✅ [TICKET-AI] Qdrant success: ${result.data.length} results`
          );
          return { success: true, method: "qdrant", data: result.data };
        }
        console.log(
          "⚠️ [TICKET-AI] Qdrant returned no results, falling back..."
        );
      } catch (qdrantError) {
        console.error("⚠️ [TICKET-AI] Qdrant failed:", qdrantError.message);
      }
    }

    // Strategy 2: Try Full-text
    try {
      const result = await searchWithFullText(query, subCategoryIds, limit);
      if (result.success && result.data.length > 0) {
        console.log(
          `✅ [TICKET-AI] Fulltext success: ${result.data.length} results`
        );
        return { success: true, method: "fulltext", data: result.data };
      }
    } catch (ftError) {
      console.error("⚠️ [TICKET-AI] Fulltext failed:", ftError.message);
    }

    // Strategy 3: Keyword fallback
    const result = await searchWithKeyword(query, subCategoryIds, limit);
    console.log(`✅ [TICKET-AI] Keyword: ${result.data?.length || 0} results`);
    return { success: true, method: "keyword", data: result.data };
  } catch (error) {
    console.error("❌ [TICKET-AI] All search methods failed:", error.message);
    return { success: false, method: "none", data: [], error: error.message };
  }
};

// ========================================
// MAIN: Get Ticket Recommendation
// Sama persis dengan logic di askQuestion controller
// ========================================
const getTicketRecommendation = async (
  query,
  subCategoryId = null,
  limit = 5
) => {
  try {
    console.log("🤖 [TICKET-AI] Getting recommendation...");

    if (!query) {
      return { success: false, error: "Query is required" };
    }

    // Convert to array
    const subCategoryIds = subCategoryId ? [subCategoryId] : [];

    // Smart search dengan fallback (Qdrant -> Fulltext -> Keyword)
    const searchResult = await smartSearch(
      query,
      subCategoryIds,
      limit,
      new Date()
    );

    console.log(
      `🔍 [TICKET-AI] Search result: ${
        searchResult.data?.length || 0
      } FAQs (method: ${searchResult.method})`
    );

    if (!searchResult.success || searchResult.data.length === 0) {
      return {
        success: true,
        answer: null,
        sources: [],
        search_method: searchResult.method || "none",
      };
    }

    // Filter by similarity threshold (sama dengan askQuestion)
    const relevantResults = searchResult.data.filter(
      (faq) => !faq.similarity || faq.similarity >= SIMILARITY_THRESHOLD
    );

    if (relevantResults.length === 0) {
      console.log("⚠️ [TICKET-AI] All results below similarity threshold");
      return {
        success: true,
        answer: null,
        sources: [],
        search_method: searchResult.method,
      };
    }

    console.log(
      `📡 [TICKET-AI] Using ${relevantResults.length} relevant FAQs for answer`
    );

    // Generate answer dengan GPT
    const answerResult = await generateAnswer(query, relevantResults);

    if (!answerResult.success) {
      return { success: false, error: answerResult.error };
    }

    return {
      success: true,
      answer: answerResult.data,
      sources: relevantResults.map((faq) => ({
        id: faq.id,
        question: faq.question,
        similarity: faq.similarity,
        similarity_level: faq.similarity_level,
        sub_categories: faq.sub_categories?.map((sc) => sc.name),
        regulation_ref: faq.regulation_ref,
      })),
      search_method: searchResult.method,
    };
  } catch (error) {
    console.error("❌ [TICKET-AI] Error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateSummary,
  generateEmbedding,
  generateAnswer,
  smartSearch,
  searchWithQdrant,
  searchWithFullText,
  searchWithKeyword,
  getTicketRecommendation,
  SIMILARITY_THRESHOLD,
  SIMILARITY_THRESHOLD_HIGH,
};
