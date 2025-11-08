// config/qdrant.js
import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrantClient = new QdrantClient({
  url: `http://${process.env.QDRANT_HOST || "localhost"}:${
    process.env.QDRANT_PORT || 6333
  }`,
});

export const COLLECTION_NAME = "qna_embeddings";

export const initQdrant = async () => {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === COLLECTION_NAME
    );

    if (!exists) {
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
      console.log(`✓ Qdrant collection '${COLLECTION_NAME}' created`);
    } else {
      console.log(`✓ Qdrant collection '${COLLECTION_NAME}' exists`);
    }
    return true;
  } catch (error) {
    console.error("✗ Qdrant initialization failed:", error.message);
    return false;
  }
};
