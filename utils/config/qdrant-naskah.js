// config/qdrant-naskah.js
// Qdrant configuration untuk RASN Naskah (Pergub Rules Embeddings)

import { QdrantClient } from "@qdrant/js-client-rest";

const { log } = require("@/utils/logger");

const qdrantUrl = `http://${process.env.QDRANT_HOST || "localhost"}:${
  process.env.QDRANT_PORT || 6333
}`;

log.info("🔧 Initializing Qdrant client for RASN Naskah:", qdrantUrl);

export const qdrantNaskahClient = new QdrantClient({
  url: qdrantUrl,
});

export const NASKAH_COLLECTION_NAME = "rasn_naskah_rules";

/**
 * Initialize Qdrant collection untuk RASN Naskah
 * Collection ini menyimpan embeddings dari aturan-aturan Pergub
 */
export const initQdrantNaskah = async () => {
  try {
    log.info("🔍 Checking Qdrant collections for RASN Naskah...");

    const collections = await qdrantNaskahClient.getCollections();
    log.debug(
      "Available collections:",
      collections.collections.map((c) => c.name)
    );

    const exists = collections.collections.some(
      (c) => c.name === NASKAH_COLLECTION_NAME
    );

    if (!exists) {
      log.info(`📦 Creating Qdrant collection '${NASKAH_COLLECTION_NAME}'...`);

      await qdrantNaskahClient.createCollection(NASKAH_COLLECTION_NAME, {
        vectors: {
          size: 3072, // text-embedding-3-large
          distance: "Cosine",
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });

      // Create payload indexes for filtering
      await qdrantNaskahClient.createPayloadIndex(NASKAH_COLLECTION_NAME, {
        field_name: "pergub_id",
        field_schema: "keyword",
      });

      await qdrantNaskahClient.createPayloadIndex(NASKAH_COLLECTION_NAME, {
        field_name: "rule_type",
        field_schema: "keyword",
      });

      await qdrantNaskahClient.createPayloadIndex(NASKAH_COLLECTION_NAME, {
        field_name: "is_active",
        field_schema: "bool",
      });

      log.info(
        `✅ Qdrant collection '${NASKAH_COLLECTION_NAME}' created successfully with indexes`
      );
    } else {
      log.info(
        `✅ Qdrant collection '${NASKAH_COLLECTION_NAME}' already exists`
      );
    }

    return true;
  } catch (error) {
    log.error("❌ Qdrant RASN Naskah initialization failed:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    return false;
  }
};

/**
 * Get collection info
 */
export const getCollectionInfo = async () => {
  try {
    const info = await qdrantNaskahClient.getCollection(NASKAH_COLLECTION_NAME);
    return {
      success: true,
      data: info,
    };
  } catch (error) {
    log.error("❌ Failed to get collection info:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Health check untuk Qdrant RASN Naskah
 */
export const healthCheck = async () => {
  try {
    await qdrantNaskahClient.api("cluster").clusterStatus();
    log.info("✅ Qdrant RASN Naskah health check: healthy");
    return {
      success: true,
      data: { status: "healthy", collection: NASKAH_COLLECTION_NAME },
    };
  } catch (error) {
    log.error("❌ Qdrant health check error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
