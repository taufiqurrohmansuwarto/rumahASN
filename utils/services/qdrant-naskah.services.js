/**
 * Qdrant Service for RASN Naskah
 *
 * Service ini menangani interaksi dengan Qdrant vector database
 * untuk menyimpan dan mencari embeddings aturan tata naskah dinas.
 */

const { QdrantClient } = require("@qdrant/js-client-rest");

// Qdrant client configuration
const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || null;
const COLLECTION_NAME = process.env.QDRANT_NASKAH_COLLECTION || "rasn_naskah_rules";
const VECTOR_SIZE = 3072; // text-embedding-3-large dimension

// Initialize Qdrant client
const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});

/**
 * Initialize collection if it doesn't exist
 */
const initCollection = async () => {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (!exists) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });

      // Create payload indexes for filtering
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: "pergub_id",
        field_schema: "keyword",
      });

      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: "rule_type",
        field_schema: "keyword",
      });

      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: "category",
        field_schema: "keyword",
      });

      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: "is_active",
        field_schema: "bool",
      });

      console.log(`✅ [QDRANT-NASKAH] Collection "${COLLECTION_NAME}" created with indexes`);
    }

    return true;
  } catch (error) {
    console.error("Failed to initialize Qdrant collection:", error.message);
    throw error;
  }
};

/**
 * Upsert a single vector
 */
const upsertVector = async (id, vector, payload = {}) => {
  try {
    await initCollection();

    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id,
          vector,
          payload,
        },
      ],
    });

    return true;
  } catch (error) {
    console.error(`Failed to upsert vector ${id}:`, error.message);
    throw error;
  }
};

/**
 * Batch upsert vectors
 */
const batchUpsert = async (vectors) => {
  try {
    await initCollection();

    // Qdrant has a limit of 100 points per batch
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await qdrantClient.upsert(COLLECTION_NAME, {
        wait: true,
        points: batch,
      });
    }

    return true;
  } catch (error) {
    console.error("Failed to batch upsert vectors:", error.message);
    throw error;
  }
};

/**
 * Search for similar vectors
 */
const searchSimilar = async (
  vector,
  {
    limit = 10,
    scoreThreshold = 0.5,
    filter = null,
    withPayload = true,
    withVector = false,
  } = {}
) => {
  try {
    await initCollection();

    const searchParams = {
      vector,
      limit,
      score_threshold: scoreThreshold,
      with_payload: withPayload,
      with_vector: withVector,
    };

    if (filter) {
      searchParams.filter = filter;
    }

    const results = await qdrantClient.search(COLLECTION_NAME, searchParams);

    return results.map((result) => ({
      id: result.id,
      score: result.score,
      payload: result.payload,
      vector: result.vector,
    }));
  } catch (error) {
    console.error("Failed to search similar vectors:", error.message);
    throw error;
  }
};

/**
 * Delete a vector by ID
 */
const deleteVector = async (id) => {
  try {
    await qdrantClient.delete(COLLECTION_NAME, {
      wait: true,
      points: [id],
    });

    return true;
  } catch (error) {
    console.error(`Failed to delete vector ${id}:`, error.message);
    throw error;
  }
};

/**
 * Delete vectors by filter
 */
const deleteByFilter = async (filter) => {
  try {
    await qdrantClient.delete(COLLECTION_NAME, {
      wait: true,
      filter,
    });

    return true;
  } catch (error) {
    console.error("Failed to delete vectors by filter:", error.message);
    throw error;
  }
};

/**
 * Update vector payload
 */
const updatePayload = async (id, payload) => {
  try {
    await qdrantClient.setPayload(COLLECTION_NAME, {
      wait: true,
      points: [id],
      payload,
    });

    return true;
  } catch (error) {
    console.error(`Failed to update payload for ${id}:`, error.message);
    throw error;
  }
};

/**
 * Get vector by ID
 */
const getVector = async (id) => {
  try {
    const result = await qdrantClient.retrieve(COLLECTION_NAME, {
      ids: [id],
      with_payload: true,
      with_vector: true,
    });

    return result[0] || null;
  } catch (error) {
    console.error(`Failed to get vector ${id}:`, error.message);
    throw error;
  }
};

/**
 * Get collection info
 */
const getCollectionInfo = async () => {
  try {
    const info = await qdrantClient.getCollection(COLLECTION_NAME);
    return {
      name: COLLECTION_NAME,
      vectorsCount: info.vectors_count,
      pointsCount: info.points_count,
      status: info.status,
      config: info.config,
    };
  } catch (error) {
    console.error("Failed to get collection info:", error.message);
    return null;
  }
};

/**
 * Health check
 */
const healthCheck = async () => {
  try {
    const result = await qdrantClient.getCollections();
    return {
      status: "ok",
      collectionsCount: result.collections.length,
      hasNaskahCollection: result.collections.some((c) => c.name === COLLECTION_NAME),
    };
  } catch (error) {
    return {
      status: "error",
      error: error.message,
    };
  }
};

/**
 * Build Qdrant filter from options
 */
const buildFilter = (options = {}) => {
  const must = [];
  const should = [];
  const mustNot = [];

  if (options.pergubId) {
    must.push({
      key: "pergub_id",
      match: { value: options.pergubId },
    });
  }

  if (options.ruleType) {
    must.push({
      key: "rule_type",
      match: { value: options.ruleType },
    });
  }

  if (options.category) {
    must.push({
      key: "category",
      match: { value: options.category },
    });
  }

  if (options.isActive !== undefined) {
    must.push({
      key: "is_active",
      match: { value: options.isActive },
    });
  }

  const filter = {};
  if (must.length > 0) filter.must = must;
  if (should.length > 0) filter.should = should;
  if (mustNot.length > 0) filter.must_not = mustNot;

  return Object.keys(filter).length > 0 ? filter : null;
};

module.exports = {
  qdrantClient,
  COLLECTION_NAME,
  VECTOR_SIZE,
  initCollection,
  upsertVector,
  batchUpsert,
  searchSimilar,
  deleteVector,
  deleteByFilter,
  updatePayload,
  getVector,
  getCollectionInfo,
  healthCheck,
  buildFilter,
};
