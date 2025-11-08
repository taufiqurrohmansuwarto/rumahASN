// services/qdrant.service.js
import { v4 as uuidv4 } from "uuid";
import { qdrantClient, COLLECTION_NAME } from "@/utils/config/qdrant";

// Upsert vector to Qdrant
export const upsertVector = async (qnaId, embedding, metadata = {}) => {
  try {
    const pointId = uuidv4();

    await qdrantClient.upsert(COLLECTION_NAME, {
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
    });

    return {
      success: true,
      data: pointId,
    };
  } catch (error) {
    console.error("Qdrant upsert error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Search similar vectors
export const searchSimilar = async (embedding, filter = {}, limit = 5) => {
  try {
    const searchParams = {
      vector: embedding,
      limit,
      with_payload: true,
    };

    // Add filters if provided
    if (Object.keys(filter).length > 0) {
      searchParams.filter = {
        must: Object.entries(filter).map(([key, value]) => ({
          key,
          match: { value },
        })),
      };
    }

    const searchResult = await qdrantClient.search(
      COLLECTION_NAME,
      searchParams
    );

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
    console.error("Qdrant search error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete vector
export const deleteVector = async (pointId) => {
  try {
    await qdrantClient.delete(COLLECTION_NAME, {
      wait: true,
      points: [pointId],
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Qdrant delete error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Update vector
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

    return {
      success: true,
    };
  } catch (error) {
    console.error("Qdrant update error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Health check
export const healthCheck = async () => {
  try {
    await qdrantClient.api("cluster").clusterStatus();
    return {
      success: true,
      data: { status: "healthy" },
    };
  } catch (error) {
    console.error("Qdrant health check error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};
