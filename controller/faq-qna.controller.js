// controllers/faq-qna.controller.js
import { handleError } from "@/utils/helper/controller-helper";
import {
  generateEmbedding,
  generateAnswer,
} from "@/utils/services/open-ai.services";
import { upsertVector, deleteVector } from "@/utils/services/qdrant.services";
import {
  smartSearch,
  searchHealthCheck,
} from "@/utils/services/search.services";

const FaqQna = require("@/models/faq-qna.model");
const { log } = require("@/utils/logger");

// CREATE FAQ dengan Qdrant Sync
export const createFaqQna = async (req, res) => {
  try {
    const {
      question,
      answer,
      regulation_ref,
      is_active = true,
      effective_date = new Date(),
      expired_date,
      sub_category_ids = [], // Array of IDs
      tags = [],
      confidence_score = 1.0,
    } = req.body;

    // Validation
    if (
      !question ||
      !answer ||
      !Array.isArray(sub_category_ids) ||
      sub_category_ids.length === 0
    ) {
      return res.status(400).json({ message: "Data tidak lengkap." });
    }

    const { customId } = req?.user;

    const payload = {
      question,
      answer,
      regulation_ref,
      is_active,
      effective_date,
      expired_date,
      tags,
      confidence_score,
      created_by: customId,
      version: 1,
      // NO sub_category_id! (removed from table)
    };

    // Insert FAQ
    const faq = await FaqQna.query().insert(payload);

    // Relate multiple sub categories via pivot table
    await faq.$relatedQuery("sub_categories").relate(sub_category_ids);

    // Sync to Qdrant
    if (process.env.QDRANT_ENABLED === "true") {
      try {
        log.info("🚀 Starting Qdrant sync for FAQ ID:", faq.id);
        log.debug("Qdrant config:", {
          enabled: process.env.QDRANT_ENABLED,
          host: process.env.QDRANT_HOST,
          port: process.env.QDRANT_PORT,
        });
        log.debug("Question:", question);

        const embeddingResult = await generateEmbedding(question);
        log.debug("Embedding result:", {
          success: embeddingResult.success,
          dataLength: embeddingResult.data?.length,
          error: embeddingResult.error,
        });

        if (embeddingResult.success) {
          const pointResult = await upsertVector(faq.id, embeddingResult.data, {
            sub_category_ids, // Store as array in Qdrant payload
            is_active: true,
            effective_date: effective_date.toISOString(),
            expired_date: expired_date ? expired_date.toISOString() : null,
          });

          log.debug("Point result:", pointResult);

          if (pointResult.success) {
            await FaqQna.query()
              .findById(faq.id)
              .patch({ qdrant_point_id: pointResult.data });

            log.info("✅ FAQ synced to Qdrant successfully");
          } else {
            log.error("❌ Point upsert failed:", pointResult.error);
          }
        } else {
          log.error("❌ Embedding generation failed:", embeddingResult.error);
        }
      } catch (qdrantError) {
        log.error("❌ Exception during Qdrant sync:", qdrantError);
      }
    } else {
      log.info("ℹ️ Qdrant sync disabled (QDRANT_ENABLED != true)");
    }

    res.status(201).json({
      message: "FAQ berhasil ditambahkan",
      data: { id: faq.id },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// UPDATE FAQ dengan Versioning (create new version, not patch!)
export const updateFaqQna = async (req, res) => {
  try {
    const { id } = req.query;
    const {
      question,
      answer,
      regulation_ref,
      is_active,
      effective_date = new Date(),
      expired_date,
      sub_category_ids = [],
      tags,
      confidence_score,
      create_new_version = true,
    } = req.body;

    const { customId } = req?.user;

    const oldFaq = await FaqQna.query()
      .findById(id)
      .withGraphFetched("sub_categories");

    if (!oldFaq) {
      return res.status(404).json({ message: "FAQ tidak ditemukan" });
    }

    // CREATE NEW VERSION
    if (create_new_version) {
      // Close old version
      await FaqQna.query().findById(id).patch({
        expired_date: new Date(),
        updated_by: customId,
      });

      // Create new version
      const newFaq = await FaqQna.query().insert({
        question: question || oldFaq.question,
        answer: answer || oldFaq.answer,
        regulation_ref: regulation_ref || oldFaq.regulation_ref,
        is_active: is_active !== undefined ? is_active : oldFaq.is_active,
        effective_date,
        expired_date,
        tags: tags || oldFaq.tags,
        confidence_score: confidence_score || oldFaq.confidence_score,
        created_by: oldFaq.created_by,
        updated_by: customId,
        version: oldFaq.version + 1,
        previous_version_id: id,
      });

      // Relate sub categories
      const subCatIds =
        sub_category_ids.length > 0
          ? sub_category_ids
          : oldFaq.sub_categories.map((sc) => sc.id);

      await newFaq.$relatedQuery("sub_categories").relate(subCatIds);

      // Sync to Qdrant
      if (process.env.QDRANT_ENABLED === "true") {
        try {
          const embeddingResult = await generateEmbedding(newFaq.question);

          if (embeddingResult.success) {
            const pointResult = await upsertVector(
              newFaq.id,
              embeddingResult.data,
              {
                sub_category_ids: subCatIds,
                is_active: newFaq.is_active,
                effective_date: effective_date.toISOString(),
                expired_date: expired_date ? expired_date.toISOString() : null,
              }
            );

            if (pointResult.success) {
              await FaqQna.query()
                .findById(newFaq.id)
                .patch({ qdrant_point_id: pointResult.data });
            }
          }
        } catch (qdrantError) {
          console.warn("⚠️ Failed to sync to Qdrant:", qdrantError.message);
        }
      }

      return res.status(200).json({
        message: "FAQ berhasil diperbarui (versi baru)",
        data: {
          old_version_id: id,
          new_version_id: newFaq.id,
          version: newFaq.version,
        },
      });
    }

    // PATCH EXISTING
    const patchPayload = {
      question,
      answer,
      regulation_ref,
      is_active,
      effective_date,
      expired_date,
      tags,
      confidence_score,
      updated_by: customId,
    };

    Object.keys(patchPayload).forEach(
      (key) => patchPayload[key] === undefined && delete patchPayload[key]
    );

    await oldFaq.$query().patch(patchPayload);

    // Update sub categories
    await oldFaq.$relatedQuery("sub_categories").unrelate();
    if (sub_category_ids.length > 0) {
      await oldFaq.$relatedQuery("sub_categories").relate(sub_category_ids);
    }

    // Update Qdrant
    if (question && process.env.QDRANT_ENABLED === "true") {
      try {
        const embeddingResult = await generateEmbedding(question);

        if (embeddingResult.success && oldFaq.qdrant_point_id) {
          const { updateVector } = await import(
            "@/utils/services/qdrant.services"
          );
          await updateVector(oldFaq.qdrant_point_id, embeddingResult.data, {
            sub_category_ids,
            is_active: patchPayload.is_active || oldFaq.is_active,
          });
        }
      } catch (qdrantError) {
        console.warn("⚠️ Failed to update Qdrant:", qdrantError.message);
      }
    }

    res.status(200).json({ message: "FAQ berhasil diubah" });
  } catch (error) {
    handleError(res, error);
  }
};

// DELETE FAQ (Soft Delete + Remove from Qdrant)
export const deleteFaqQna = async (req, res) => {
  try {
    const { id } = req.query;
    const { customId } = req?.user;

    const faq = await FaqQna.query().findById(id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ tidak ditemukan" });
    }

    // Soft delete (recommended untuk audit trail)
    await FaqQna.query().findById(id).patch({
      is_active: false,
      updated_by: customId,
    });

    // Remove from Qdrant
    if (faq.qdrant_point_id && process.env.QDRANT_ENABLED === "true") {
      try {
        await deleteVector(faq.qdrant_point_id);
        console.log("✓ Removed from Qdrant");
      } catch (qdrantError) {
        console.warn("⚠️ Failed to delete from Qdrant:", qdrantError.message);
      }
    }

    // Uncomment jika mau hard delete:
    // await FaqQna.query().deleteById(id);

    res.status(200).json({ message: "FAQ berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

// GET FAQ List dengan filtering
export const getFaqQna = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      is_active,
      sub_category_id, // Single ID
      sub_category_ids, // Multiple IDs (comma-separated)
      show_expired = false,
    } = req.query;

    let query = FaqQna.query().withGraphFetched("[sub_categories.[category]]");

    // Search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("question", "ilike", `%${search}%`)
          .orWhere("answer", "ilike", `%${search}%`)
          .orWhere("regulation_ref", "ilike", `%${search}%`);
      });
    }

    // Filter active
    if (is_active !== undefined) {
      query = query.where("is_active", is_active);
    }

    // Filter by single sub_category
    if (sub_category_id) {
      query = query
        .joinRelated("sub_categories")
        .where("sub_categories.id", sub_category_id);
    }

    // Filter by multiple sub_categories
    if (sub_category_ids) {
      const ids = sub_category_ids.split(",").map((id) => parseInt(id));
      query = query
        .joinRelated("sub_categories")
        .whereIn("sub_categories.id", ids);
    }

    // Filter expired
    if (show_expired === "false" || !show_expired) {
      const now = new Date();
      query = query.where((builder) => {
        builder.whereNull("expired_date").orWhere("expired_date", ">", now);
      });
    }

    const total = await query.clone().resultSize();

    let data;
    if (parseInt(limit) === -1) {
      data = await query.orderBy("created_at", "desc");
    } else {
      const offset = (page - 1) * limit;
      data = await query
        .offset(offset)
        .limit(limit)
        .orderBy("created_at", "desc");
    }

    res.status(200).json({
      data,
      meta: {
        total,
        page: parseInt(limit) === -1 ? 1 : parseInt(page),
        limit: parseInt(limit),
        totalPages: parseInt(limit) === -1 ? 1 : Math.ceil(total / limit),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// GET FAQ by ID
export const getFaqQnaById = async (req, res) => {
  try {
    const { id } = req.query;

    const faqQna = await FaqQna.query()
      .findById(id)
      .withGraphFetched("[sub_categories.[category]]");

    if (!faqQna) {
      return res.status(404).json({ message: "FAQ tidak ditemukan" });
    }

    res.status(200).json(faqQna);
  } catch (error) {
    handleError(res, error);
  }
};

// ===== NEW: RAG ENDPOINTS =====

// ASK Question (RAG dengan smart fallback)
export const askQuestion = async (req, res) => {
  try {
    const {
      query,
      sub_category_id = null,
      reference_date = new Date(),
      limit = 5,
    } = req.body;

    log.info("🤖 AI Ask Question:", { query, sub_category_id, limit });

    if (!query) {
      return res.status(400).json({ message: "Query wajib diisi" });
    }

    // Convert sub_category_id to array for smartSearch
    const subCategoryIds = sub_category_id ? [sub_category_id] : [];

    // Smart search dengan fallback (Qdrant -> Full-text -> Keyword)
    const searchResult = await smartSearch(
      query,
      subCategoryIds, // Pass as array
      limit,
      new Date(reference_date)
    );

    log.debug("Search result:", {
      success: searchResult.success,
      method: searchResult.method,
      count: searchResult.data?.length,
    });

    if (!searchResult.success || searchResult.data.length === 0) {
      return res.status(200).json({
        answer:
          "Maaf, tidak ada informasi yang relevan untuk menjawab pertanyaan Anda.",
        sources: [],
        search_method: searchResult.method || "none",
      });
    }

    // Additional safety check: filter by similarity threshold (minimum 50%)
    const SIMILARITY_THRESHOLD = 0.5;
    const relevantResults = searchResult.data.filter(
      (faq) => !faq.similarity || faq.similarity >= SIMILARITY_THRESHOLD
    );

    if (relevantResults.length === 0) {
      log.warn("All search results below similarity threshold");
      return res.status(200).json({
        answer:
          "Maaf, tidak ada informasi yang cukup relevan untuk menjawab pertanyaan Anda. Silakan coba dengan kata kunci yang lebih spesifik atau hubungi layanan bantuan kami.",
        sources: [],
        search_method: searchResult.method,
      });
    }

    log.info(
      `Using ${relevantResults.length} relevant results (threshold: ${SIMILARITY_THRESHOLD})`
    );

    // Generate answer dengan GPT
    const answerResult = await generateAnswer(query, relevantResults);

    log.debug("AI answer result:", {
      success: answerResult.success,
      hasAnswer: !!answerResult.data,
    });

    if (!answerResult.success) {
      return res.status(500).json({
        message: "Gagal generate jawaban",
        error: answerResult.error,
      });
    }

    res.status(200).json({
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
    });
  } catch (error) {
    handleError(res, error);
  }
};

// GET FAQ History (all versions)
export const getFaqQnaHistory = async (req, res) => {
  try {
    const { id } = req.query;

    const faq = await FaqQna.query().findById(id);
    if (!faq) {
      return res.status(404).json({ message: "FAQ tidak ditemukan" });
    }

    // Find root version
    let rootId = id;
    let current = faq;
    while (current.previous_version_id) {
      current = await FaqQna.query().findById(current.previous_version_id);
      if (!current) break;
      rootId = current.id;
    }

    // Get all versions
    const history = await FaqQna.query()
      .where("id", rootId)
      .orWhere("previous_version_id", rootId)
      .withGraphFetched("sub_categories")
      .orderBy("version", "desc");

    res.status(200).json({
      data: history,
      meta: {
        total_versions: history.length,
        current_version: faq.version,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Health Check (check all services)
export const healthCheck = async (req, res) => {
  try {
    const searchHealth = await searchHealthCheck();

    res.status(200).json({
      status: "healthy",
      services: {
        postgres: true,
        fulltext: searchHealth.fulltext,
        keyword: searchHealth.keyword,
        qdrant: searchHealth.qdrant,
      },
      config: {
        search_strategy: process.env.SEARCH_STRATEGY || "hybrid",
        qdrant_enabled: process.env.QDRANT_ENABLED === "true",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
    });
  }
};

// Bulk Sync to Qdrant (untuk data existing)
export const bulkSyncToQdrant = async (req, res) => {
  try {
    const { limit = 100, force = "false" } = req.query;
    const isForceSync = force === "true";

    log.info("🔄 Bulk Sync to Qdrant:", { limit, force: isForceSync });

    // Jika force=true, reset semua qdrant_point_id dan sync ulang SEMUA
    let query = FaqQna.query().where("is_active", true);

    if (isForceSync) {
      log.warn("⚠️ FORCE SYNC: Resetting all qdrant_point_id...");

      // Reset semua qdrant_point_id
      await FaqQna.query()
        .where("is_active", true)
        .patch({ qdrant_point_id: null });

      log.info("✅ All qdrant_point_id reset to null");
    } else {
      // Normal mode: hanya sync yang belum ada qdrant_point_id
      query = query.whereNull("qdrant_point_id");
    }

    const faqs = await query.limit(limit).withGraphFetched("sub_categories");

    if (faqs.length === 0) {
      return res.status(200).json({
        message: "Semua FAQ sudah di-sync ke Qdrant",
        synced: 0,
        mode: isForceSync ? "force" : "incremental",
      });
    }

    log.info(`📊 Found ${faqs.length} FAQs to sync`);

    let synced = 0;
    let failed = 0;
    const errors = [];

    for (const faq of faqs) {
      try {
        const embeddingResult = await generateEmbedding(faq.question);

        if (embeddingResult.success) {
          const pointResult = await upsertVector(faq.id, embeddingResult.data, {
            sub_category_ids: faq.sub_categories.map((sc) => sc.id),
            is_active: faq.is_active,
            effective_date: faq.effective_date
              ? new Date(faq.effective_date).toISOString()
              : null,
            expired_date: faq.expired_date
              ? new Date(faq.expired_date).toISOString()
              : null,
          });

          if (pointResult.success) {
            await FaqQna.query()
              .findById(faq.id)
              .patch({ qdrant_point_id: pointResult.data });
            synced++;
            log.debug(`✅ Synced FAQ ${faq.id}`);
          } else {
            failed++;
            errors.push({ id: faq.id, error: pointResult.error });
            log.error(`❌ Failed to sync FAQ ${faq.id}:`, pointResult.error);
          }
        } else {
          failed++;
          errors.push({ id: faq.id, error: embeddingResult.error });
          log.error(
            `❌ Failed to generate embedding for FAQ ${faq.id}:`,
            embeddingResult.error
          );
        }
      } catch (error) {
        failed++;
        errors.push({ id: faq.id, error: error.message });
        log.error(`❌ Failed to sync FAQ ${faq.id}:`, error.message);
      }
    }

    log.info(`✅ Bulk sync completed: ${synced} synced, ${failed} failed`);

    res.status(200).json({
      message: "Bulk sync completed",
      mode: isForceSync ? "force" : "incremental",
      synced,
      failed,
      total: faqs.length,
      errors: failed > 0 ? errors : undefined,
    });
  } catch (error) {
    handleError(res, error);
  }
};
