// services/search.service.js - adjusted untuk FaqQna

import FaqQna from "@/models/faq-qna.model";
import { healthCheck, searchSimilar } from "@/utils/services/qdrant.services";
import { generateEmbedding } from "@/utils/services/open-ai.services";

const { log } = require("@/utils/logger");

const SEARCH_STRATEGY = process.env.SEARCH_STRATEGY || "hybrid";
const QDRANT_ENABLED = process.env.QDRANT_ENABLED === "true";

// RAG Quality Settings
const SIMILARITY_THRESHOLD = parseFloat(
  process.env.SIMILARITY_THRESHOLD || "0.5"
); // Minimum 50%
const SIMILARITY_THRESHOLD_HIGH = parseFloat(
  process.env.SIMILARITY_THRESHOLD_HIGH || "0.7"
); // High confidence 70%
const MAX_CONTEXT_ITEMS = parseInt(process.env.MAX_CONTEXT_ITEMS || "3"); // Top 3 FAQ

// ========================================
// HELPER: Calculate text similarity (Jaccard)
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

// ========================================
// SMART SEARCH (CHANGED! - sub_category_ids is now array)
// ========================================
export const smartSearch = async (
  query,
  subCategoryIds = [],
  limit = 5,
  referenceDate = new Date()
) => {
  try {
    log.info("🔍 Smart Search started:", {
      query,
      subCategoryIds,
      limit,
      strategy: SEARCH_STRATEGY,
      qdrantEnabled: QDRANT_ENABLED,
    });

    // Strategy 1: Try Qdrant
    if (
      QDRANT_ENABLED &&
      (SEARCH_STRATEGY === "qdrant" || SEARCH_STRATEGY === "hybrid")
    ) {
      try {
        log.debug("Attempting Qdrant search...");
        const result = await searchWithQdrant(
          query,
          subCategoryIds,
          limit,
          referenceDate
        );
        if (result.success && result.data.length > 0) {
          log.info(`✅ Qdrant search success: ${result.data.length} results`);
          return {
            success: true,
            method: "qdrant",
            data: result.data,
          };
        }
        log.warn("Qdrant search returned no results");
      } catch (qdrantError) {
        log.error("⚠️ Qdrant search failed, falling back:", qdrantError);
      }
    }

    // Strategy 2: Fallback to Full-Text
    log.debug("Attempting Full-text search...");
    const result = await searchWithFullText(query, subCategoryIds, limit);
    log.info(`✅ Full-text search: ${result.data?.length || 0} results`);
    return {
      success: true,
      method: "fulltext",
      data: result.data,
    };
  } catch (error) {
    log.error("❌ All search methods failed:", error);
    // Strategy 3: Emergency keyword
    log.debug("Attempting Keyword search (fallback)...");
    const result = await searchWithKeyword(query, subCategoryIds, limit);
    log.info(`✅ Keyword search: ${result.data?.length || 0} results`);
    return {
      success: true,
      method: "keyword",
      data: result.data,
    };
  }
};

// ========================================
// SEARCH WITH QDRANT (CHANGED! - array filtering)
// ========================================
export const searchWithQdrant = async (
  query,
  subCategoryIds,
  limit,
  referenceDate = new Date()
) => {
  log.debug("Qdrant search params:", {
    query,
    subCategoryIds,
    limit,
    referenceDate,
  });

  // Generate embedding
  const embeddingResult = await generateEmbedding(query);
  if (!embeddingResult.success) {
    throw new Error(embeddingResult.error);
  }

  log.debug("Embedding generated:", { length: embeddingResult.data?.length });

  // Build filters (CHANGED!)
  const filters = {
    is_active: true,
    reference_date: referenceDate,
  };

  // Add sub_category_ids filter if provided
  if (
    subCategoryIds &&
    Array.isArray(subCategoryIds) &&
    subCategoryIds.length > 0
  ) {
    filters.sub_category_ids = subCategoryIds; // Array!
  }

  log.debug("Qdrant filters:", filters);

  // Search in Qdrant
  const vectorResult = await searchSimilar(
    embeddingResult.data,
    filters, // Pass filters object
    limit
  );

  log.debug("Qdrant vector result:", {
    success: vectorResult.success,
    count: vectorResult.data?.length,
  });

  if (!vectorResult.success || vectorResult.data.length === 0) {
    return { success: true, data: [] };
  }

  // Get full data from PostgreSQL
  const qnaIds = vectorResult.data.map((v) => v.qna_id);
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

  // Merge with similarity scores and apply threshold filtering
  let results = qnaData
    .map((qna) => {
      const vector = vectorResult.data.find((v) => v.qna_id === qna.id);
      const similarity = vector ? vector.similarity : 0;

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
        log.debug(
          `Filtered out FAQ ${
            qna.id
          } due to low similarity: ${qna.similarity.toFixed(3)}`
        );
        return false;
      }
      return true;
    })
    .sort((a, b) => b.similarity - a.similarity);

  // Diversity check: remove near-duplicate results
  // Keep results that are sufficiently different from each other
  const diverseResults = [];
  const SIMILARITY_DIVERSITY_THRESHOLD = 0.95; // 95% similar = too similar

  for (const result of results) {
    let isDuplicate = false;

    for (const selected of diverseResults) {
      // Simple diversity check: compare question text similarity
      const similarity = calculateTextSimilarity(
        result.question,
        selected.question
      );

      if (similarity > SIMILARITY_DIVERSITY_THRESHOLD) {
        log.debug(
          `Skipped FAQ ${result.id} due to high similarity with FAQ ${selected.id}`
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

  log.info(
    `✅ Applied reranking: ${results.length} diverse results (threshold: ${SIMILARITY_THRESHOLD}, max: ${MAX_CONTEXT_ITEMS})`
  );

  return {
    success: true,
    data: results,
  };
};

// ========================================
// SEARCH WITH FULLTEXT (CHANGED! - array filtering)
// ========================================
export const searchWithFullText = async (query, subCategoryIds = [], limit) => {
  try {
    const results = await FaqQna.fullTextSearch(query, subCategoryIds, limit);

    return {
      success: true,
      data: results.map((qna) => ({
        ...qna,
        similarity: qna.rank,
        search_method: "fulltext",
      })),
    };
  } catch (error) {
    console.error("Full-text search error:", error.message);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

// ========================================
// SEARCH WITH KEYWORD (CHANGED! - array filtering)
// ========================================
export const searchWithKeyword = async (query, subCategoryIds = [], limit) => {
  try {
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

    return {
      success: true,
      data: results.map((qna) => ({
        ...qna,
        similarity: 0.5,
        search_method: "keyword",
      })),
    };
  } catch (error) {
    console.error("Keyword search error:", error.message);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

// ========================================
// HEALTH CHECK (NO CHANGE)
// ========================================
export const searchHealthCheck = async () => {
  const status = {
    fulltext: true,
    keyword: true,
    qdrant: false,
  };

  if (QDRANT_ENABLED) {
    const qdrantHealth = await healthCheck();
    status.qdrant = qdrantHealth.success;
  }

  return status;
};
