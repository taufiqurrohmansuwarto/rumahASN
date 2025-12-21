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

// Diversity threshold untuk menghindari duplikat (sama dengan search.services.js)
const SIMILARITY_DIVERSITY_THRESHOLD = 0.95;

// Initialize Qdrant client only
let qdrantClient = null;

// ========================================
// HELPER: Calculate text similarity (Jaccard) - sama dengan search.services.js
// ========================================
const calculateTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;

  // Tokenize and normalize
  const tokens1 = new Set(
    text1
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2)
  );
  const tokens2 = new Set(
    text2
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2)
  );

  // Jaccard similarity: intersection / union
  const intersection = new Set([...tokens1].filter((t) => tokens2.has(t)));
  const union = new Set([...tokens1, ...tokens2]);

  return union.size > 0 ? intersection.size / union.size : 0;
};

const getQdrantClient = () => {
  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: QDRANT_URL,
      // Skip version check untuk Node.js 16 compatibility
      checkCompatibility: false,
    });
    console.log("✅ [TICKET-AI] Qdrant client initialized:", QDRANT_URL);
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
// PREPROCESSING: Sama persis dengan open-ai.services.js
// ========================================
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

  return processed;
};

// ========================================
// OPENAI: Generate Embedding (via Axios) - sama dengan open-ai.services.js
// ========================================
const generateEmbedding = async (text) => {
  try {
    // Preprocess text untuk consistent embeddings (sama dengan open-ai.services.js)
    const processedText = preprocessText(text);

    if (!processedText) {
      return { success: false, error: "Text is empty after preprocessing" };
    }

    console.log(
      "🔍 [TICKET-AI] Generating embedding for:",
      processedText.substring(0, 50) + "..."
    );

    const response = await openaiRequest("/embeddings", {
      model: "text-embedding-3-large",
      input: processedText,
      dimensions: 3072,
    });

    console.log(
      "✅ [TICKET-AI] Embedding generated, length:",
      response.data[0].embedding.length
    );

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
// QDRANT: Search Similar (sama dengan search.services.js)
// ========================================
const searchWithQdrant = async (
  query,
  subCategoryIds = [],
  limit = 5,
  referenceDate = new Date()
) => {
  try {
    console.log("🔍 [TICKET-AI] Qdrant search starting...");
    console.log("🔍 [TICKET-AI] Search params:", {
      query: query.substring(0, 50) + "...",
      subCategoryIds,
      limit,
    });

    // Generate embedding (dengan preprocessing yang sama dengan open-ai.services.js)
    const embeddingResult = await generateEmbedding(query);
    if (!embeddingResult.success) {
      throw new Error(embeddingResult.error);
    }

    const client = getQdrantClient();

    // Build filters (sama dengan buildQdrantFilter di qdrant.services.js)
    const must = [];

    // Handle sub_category_ids (array filtering)
    if (
      subCategoryIds &&
      Array.isArray(subCategoryIds) &&
      subCategoryIds.length > 0
    ) {
      must.push({
        key: "sub_category_ids",
        match: { any: subCategoryIds },
      });
      console.log(
        "🔍 [TICKET-AI] Added sub_category_ids filter:",
        subCategoryIds
      );
    }

    // Handle is_active (boolean)
    must.push({
      key: "is_active",
      match: { value: true },
    });

    const searchParams = {
      vector: embeddingResult.data,
      limit: limit * 2, // Get more for diversity filtering
      with_payload: true,
    };

    if (must.length > 0) {
      searchParams.filter = { must };
    }

    console.log("🔍 [TICKET-AI] Qdrant search params:", {
      hasFilter: !!searchParams.filter,
      filterCount: must.length,
      limit: searchParams.limit,
    });

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

    // Merge with similarity scores and apply threshold filtering
    let results = qnaData
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
        // Filter out results below threshold
        if (qna.similarity < SIMILARITY_THRESHOLD) {
          console.log(
            `⚠️ [TICKET-AI] Filtered out FAQ ${
              qna.id
            } due to low similarity: ${qna.similarity?.toFixed(3)}`
          );
          return false;
        }
        return true;
      })
      .sort((a, b) => b.similarity - a.similarity);

    // Diversity check: remove near-duplicate results (sama dengan search.services.js)
    const diverseResults = [];

    for (const result of results) {
      let isDuplicate = false;

      for (const selected of diverseResults) {
        // Simple diversity check: compare question text similarity
        const similarity = calculateTextSimilarity(
          result.question,
          selected.question
        );

        if (similarity > SIMILARITY_DIVERSITY_THRESHOLD) {
          console.log(
            `⚠️ [TICKET-AI] Skipped FAQ ${result.id} due to high similarity with FAQ ${selected.id}`
          );
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        diverseResults.push(result);
      }

      // Stop if we have enough diverse results
      if (diverseResults.length >= MAX_CONTEXT_ITEMS) {
        break;
      }
    }

    results = diverseResults;

    console.log(
      `📊 [TICKET-AI] Applied reranking: ${results.length} diverse results (threshold: ${SIMILARITY_THRESHOLD}, max: ${MAX_CONTEXT_ITEMS})`
    );

    return { success: true, data: results };
  } catch (error) {
    console.error("❌ [TICKET-AI] Qdrant search error:", error.message);
    return { success: false, error: error.message, data: [] };
  }
};

// ========================================
// FULLTEXT: Search with PostgreSQL (sama dengan search.services.js)
// ========================================
const searchWithFullText = async (query, subCategoryIds = [], limit = 5) => {
  try {
    console.log("🔍 [TICKET-AI] Fulltext search starting...");

    const results = await FaqQna.fullTextSearch(query, subCategoryIds, limit);

    console.log(`✅ [TICKET-AI] Fulltext: ${results.length} results`);

    return {
      success: true,
      data: results.map((qna) => ({
        ...qna,
        similarity: qna.rank, // Gunakan rank langsung, sama dengan search.services.js
        search_method: "fulltext",
      })),
    };
  } catch (error) {
    console.error("❌ [TICKET-AI] Fulltext search error:", error.message);
    return { success: false, error: error.message, data: [] };
  }
};

// ========================================
// KEYWORD: Fallback search (sama dengan search.services.js)
// ========================================
const searchWithKeyword = async (query, subCategoryIds = [], limit = 5) => {
  try {
    console.log("🔍 [TICKET-AI] Keyword search starting...");

    const keywords = query
      .toLowerCase()
      .split(" ")
      .filter((k) => k.length > 2);

    let qb = FaqQna.query()
      .where("is_active", true)
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

    // Filter by multiple sub categories
    if (subCategoryIds && subCategoryIds.length > 0) {
      qb = qb
        .joinRelated("sub_categories")
        .whereIn("sub_categories.id", subCategoryIds);
    }

    const results = await qb;

    console.log(`✅ [TICKET-AI] Keyword: ${results.length} results`);

    return {
      success: true,
      data: results.map((qna) => ({
        ...qna,
        similarity: 0.5, // Sama dengan search.services.js
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
        console.log("🔍 [TICKET-AI] Attempting Qdrant search...");
        const result = await searchWithQdrant(
          query,
          subCategoryIds,
          limit,
          referenceDate
        );
        if (result.success && result.data.length > 0) {
          console.log(
            `✅ [TICKET-AI] Qdrant search success: ${result.data.length} results`
          );
          return { success: true, method: "qdrant", data: result.data };
        }
        console.log("⚠️ [TICKET-AI] Qdrant search returned no results");
      } catch (qdrantError) {
        console.error(
          "⚠️ [TICKET-AI] Qdrant search failed, falling back:",
          qdrantError.message
        );
      }
    }

    // Strategy 2: Fallback to Full-Text (sama dengan search.services.js)
    console.log("🔍 [TICKET-AI] Attempting Full-text search...");
    const result = await searchWithFullText(query, subCategoryIds, limit);
    console.log(
      `✅ [TICKET-AI] Full-text search: ${result.data?.length || 0} results`
    );
    return {
      success: true,
      method: "fulltext",
      data: result.data,
    };
  } catch (error) {
    // Strategy 3: Emergency keyword (sama dengan search.services.js - hanya di catch)
    console.error("❌ [TICKET-AI] All search methods failed:", error.message);
    console.log("🔍 [TICKET-AI] Attempting Keyword search (fallback)...");
    const result = await searchWithKeyword(query, subCategoryIds, limit);
    console.log(
      `✅ [TICKET-AI] Keyword search: ${result.data?.length || 0} results`
    );
    return {
      success: true,
      method: "keyword",
      data: result.data,
    };
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
    console.log("🔍 [TICKET-AI] Query for search:", query);
    console.log("🔍 [TICKET-AI] Sub category ID:", subCategoryId);

    if (!query) {
      return { success: false, error: "Query is required" };
    }

    // Convert to array
    const subCategoryIds = subCategoryId ? [subCategoryId] : [];
    console.log("🔍 [TICKET-AI] Sub category IDs array:", subCategoryIds);

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
