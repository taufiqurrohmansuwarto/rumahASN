// services/qdrant.service.js
import { v4 as uuidv4 } from "uuid";
import {
  qdrantClient,
  COLLECTION_NAME,
  initQdrant,
} from "@/utils/config/qdrant";

const { log } = require("@/utils/logger");

// Flag to track if collection is initialized
let collectionInitialized = false;

// Helper to ensure collection exists
const ensureCollection = async () => {
  if (collectionInitialized) return true;

  try {
    log.info("🔍 Checking if Qdrant collection exists...");
    await initQdrant();
    collectionInitialized = true;
    log.info("✅ Qdrant collection ready");
    return true;
  } catch (error) {
    log.error("❌ Failed to initialize Qdrant collection:", error);
    return false;
  }
};

// ========================================
// UPSERT VECTOR (UPDATED - with auto-init)
// ========================================
export const upsertVector = async (qnaId, embedding, metadata = {}) => {
  try {
    log.debug("🔍 Qdrant Upsert Debug:", {
      qnaId,
      collection: COLLECTION_NAME,
      embeddingType: typeof embedding,
      embeddingLength: Array.isArray(embedding)
        ? embedding.length
        : "NOT ARRAY",
      metadata,
      clientExists: !!qdrantClient,
    });

    if (!qdrantClient) {
      throw new Error("Qdrant client is not initialized");
    }

    // Ensure collection exists before upsert
    const collectionReady = await ensureCollection();
    if (!collectionReady) {
      throw new Error("Qdrant collection is not ready");
    }

    if (!Array.isArray(embedding)) {
      throw new Error("Embedding must be an array");
    }

    if (embedding.length === 0) {
      throw new Error("Embedding array is empty");
    }

    const pointId = uuidv4();
    log.debug("Generated Point ID:", pointId);

    const upsertPayload = {
      wait: true,
      points: [
        {
          id: pointId,
          vector: embedding,
          payload: {
            qna_id: qnaId,
            ...metadata,
          },
        },
      ],
    };

    log.debug("Upsert payload keys:", Object.keys(upsertPayload));
    log.debug("Point count:", upsertPayload.points.length);
    log.debug("Vector length:", upsertPayload.points[0].vector.length);

    await qdrantClient.upsert(COLLECTION_NAME, upsertPayload);

    log.info("✅ Qdrant upsert success! Point ID:", pointId);

    return {
      success: true,
      data: pointId,
    };
  } catch (error) {
    log.error("❌ Qdrant upsert error:", {
      message: error.message,
      type: error.constructor.name,
      name: error.name,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      code: error.code,
    });

    // Log full error for debugging
    if (error.stack) {
      log.error("Full stack trace:", error.stack);
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

// ========================================
// SEARCH SIMILAR (CHANGED! - support array filtering)
// ========================================
export const searchSimilar = async (embedding, filters = {}, limit = 5) => {
  try {
    log.debug("🔍 Qdrant searchSimilar called:", {
      embeddingLength: embedding?.length,
      filters,
      limit,
    });

    const searchParams = {
      vector: embedding,
      limit,
      with_payload: true,
    };

    // Build filter dari filters object
    const qdrantFilters = buildQdrantFilter(filters);

    log.debug("Built Qdrant filters:", JSON.stringify(qdrantFilters, null, 2));

    if (qdrantFilters) {
      searchParams.filter = qdrantFilters;
    }

    log.debug("Final search params:", {
      collection: COLLECTION_NAME,
      limit: searchParams.limit,
      hasFilter: !!searchParams.filter,
    });

    const searchResult = await qdrantClient.search(
      COLLECTION_NAME,
      searchParams
    );

    log.info(`✅ Qdrant search returned ${searchResult.length} results`);

    const results = searchResult.map((result) => ({
      qna_id: result.payload.qna_id,
      similarity: result.score,
      payload: result.payload,
    }));

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    log.error("❌ Qdrant search error:", {
      message: error.message,
      name: error.name,
      response: error.response?.data,
    });
    log.error("Full error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ========================================
// BUILD QDRANT FILTER (NEW! - helper function)
// ========================================
const buildQdrantFilter = (filters) => {
  const must = [];

  log.debug("Building Qdrant filter from:", filters);

  // Handle sub_category_ids (array filtering)
  if (filters.sub_category_ids && Array.isArray(filters.sub_category_ids)) {
    if (filters.sub_category_ids.length > 0) {
      // Match ANY of the categories
      must.push({
        key: "sub_category_ids",
        match: {
          any: filters.sub_category_ids,
        },
      });
      log.debug("Added sub_category_ids filter:", filters.sub_category_ids);
    }
  }

  // Handle is_active (boolean)
  if (filters.is_active !== undefined) {
    must.push({
      key: "is_active",
      match: {
        value: filters.is_active,
      },
    });
    log.debug("Added is_active filter:", filters.is_active);
  }

  // Handle effective_date (range - must be <= current date)
  if (filters.effective_date) {
    must.push({
      key: "effective_date",
      range: {
        lte: filters.effective_date,
      },
    });
    log.debug("Added effective_date filter (lte):", filters.effective_date);
  }

  // Handle expired_date (range - must be >= current date)
  if (filters.expired_date) {
    must.push({
      key: "expired_date",
      range: {
        gte: filters.expired_date,
      },
    });
    log.debug("Added expired_date filter (gte):", filters.expired_date);
  }

  // Handle confidence_score (range)
  if (filters.min_confidence !== undefined) {
    must.push({
      key: "confidence_score",
      range: {
        gte: filters.min_confidence,
      },
    });
    log.debug("Added confidence_score filter:", filters.min_confidence);
  }

  // Handle tags (array matching)
  if (filters.tags && Array.isArray(filters.tags)) {
    if (filters.tags.length > 0) {
      must.push({
        key: "tags",
        match: {
          any: filters.tags,
        },
      });
      log.debug("Added tags filter:", filters.tags);
    }
  }

  // Build final filter
  if (must.length === 0) {
    log.debug("No filters to apply");
    return null;
  }

  const filter = { must };

  log.debug("Final Qdrant filter structure:", filter);

  return filter;
};

// ========================================
// DELETE VECTOR (NO CHANGE)
// ========================================
export const deleteVector = async (pointId) => {
  try {
    await qdrantClient.delete(COLLECTION_NAME, {
      wait: true,
      points: [pointId],
    });

    log.info("✅ Vector deleted from Qdrant:", pointId);

    return {
      success: true,
    };
  } catch (error) {
    log.error("❌ Qdrant delete error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ========================================
// UPDATE VECTOR (NO CHANGE)
// ========================================
export const updateVector = async (pointId, embedding, metadata = {}) => {
  try {
    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id: pointId,
          vector: embedding,
          payload: metadata,
        },
      ],
    });

    log.info("✅ Vector updated in Qdrant:", pointId);

    return {
      success: true,
    };
  } catch (error) {
    log.error("❌ Qdrant update error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ========================================
// HEALTH CHECK (NO CHANGE)
// ========================================
export const healthCheck = async () => {
  try {
    await qdrantClient.api("cluster").clusterStatus();
    log.info("✅ Qdrant health check: healthy");
    return {
      success: true,
      data: { status: "healthy" },
    };
  } catch (error) {
    log.error("❌ Qdrant health check error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ========================================
// GET COLLECTION INFO (NEW! - utility)
// ========================================
export const getCollectionInfo = async () => {
  try {
    const info = await qdrantClient.getCollection(COLLECTION_NAME);
    log.debug("Qdrant collection info:", info);
    return {
      success: true,
      data: info,
    };
  } catch (error) {
    log.error("❌ Qdrant collection info error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ========================================
// BATCH UPSERT (NEW! - for bulk operations)
// ========================================
export const batchUpsert = async (points) => {
  try {
    // points format: [{ id, vector, payload }, ...]
    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });

    log.info(`✅ Batch upsert success: ${points.length} points`);

    return {
      success: true,
      data: { count: points.length },
    };
  } catch (error) {
    log.error("❌ Qdrant batch upsert error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
