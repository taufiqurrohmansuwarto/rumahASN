// config/qdrant.js
import { QdrantClient } from "@qdrant/js-client-rest";

const { log } = require("@/utils/logger");

const qdrantUrl = `http://${process.env.QDRANT_HOST || "localhost"}:${
  process.env.QDRANT_PORT || 6333
}`;

log.info("🔧 Initializing Qdrant client:", qdrantUrl);

export const qdrantClient = new QdrantClient({
  url: qdrantUrl,
});

export const COLLECTION_NAME = "qna_embeddings";

export const initQdrant = async () => {
  try {
    log.info("🔍 Checking Qdrant collections...");

    const collections = await qdrantClient.getCollections();
    log.debug(
      "Available collections:",
      collections.collections.map((c) => c.name)
    );

    const exists = collections.collections.some(
      (c) => c.name === COLLECTION_NAME
    );

    if (!exists) {
      log.info(`📦 Creating Qdrant collection '${COLLECTION_NAME}'...`);

      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 3072, // text-embedding-3-large
          distance: "Cosine",
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });

      log.info(
        `✅ Qdrant collection '${COLLECTION_NAME}' created successfully`
      );
    } else {
      log.info(`✅ Qdrant collection '${COLLECTION_NAME}' already exists`);
    }

    return true;
  } catch (error) {
    log.error("❌ Qdrant initialization failed:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    return false;
  }
};
