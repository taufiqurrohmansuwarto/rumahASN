// services/search.service.js - adjusted untuk FaqQna

import { generateEmbedding } from "./open-ai.services";
import { searchSimilar } from "./qdrant.services";
import FaqQna from "@/models/faq-qna.model";

export const searchWithQdrant = async (
  query,
  subCategoryId,
  limit,
  referenceDate = new Date()
) => {
  const embeddingResult = await generateEmbedding(query);
  if (!embeddingResult.success) {
    throw new Error(embeddingResult.error);
  }

  const filter = subCategoryId
    ? { sub_category_id: subCategoryId, is_active: true }
    : { is_active: true };

  const vectorResult = await searchSimilar(embeddingResult.data, filter, limit);

  if (!vectorResult.success || vectorResult.data.length === 0) {
    return { success: true, data: [] };
  }

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
    .withGraphFetched("subCategory");

  const results = qnaData
    .map((qna) => {
      const vector = vectorResult.data.find((v) => v.qna_id === qna.id);
      return {
        ...qna,
        similarity: vector ? vector.similarity : 0,
        search_method: "vector",
      };
    })
    .sort((a, b) => b.similarity - a.similarity);

  return { success: true, data: results };
};

export const searchWithFullText = async (query, subCategoryId, limit) => {
  try {
    const results = await FaqQna.fullTextSearch(query, subCategoryId, limit);

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
    return { success: false, error: error.message, data: [] };
  }
};

export const searchWithKeyword = async (query, subCategoryId, limit) => {
  try {
    const keywords = query
      .toLowerCase()
      .split(" ")
      .filter((k) => k.length > 2);

    let qb = FaqQna.query()
      .where("is_active", true)
      .withGraphFetched("subCategory")
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

    if (subCategoryId) {
      qb = qb.where("sub_category_id", subCategoryId);
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
    return { success: false, error: error.message, data: [] };
  }
};
