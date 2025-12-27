/**
 * Admin Controller - RASN Naskah
 * Manage Pergub dan Pergub Rules (Admin only)
 */

const { handleError } = require("@/utils/helper/controller-helper");
const Pergub = require("@/models/rasn-naskah/pergub.model");
const PergubRules = require("@/models/rasn-naskah/pergub-rules.model");
const { generateEmbedding } = require("@/utils/services/open-ai.services");
const {
  upsertRuleVector,
  deleteRuleVector,
} = require("@/utils/services/qdrant-naskah.services");

// =====================
// PERGUB CRUD
// =====================

/**
 * Get all Pergub
 */
const getPergubs = async (req, res) => {
  try {
    const { is_active } = req?.query;

    let query = Pergub.query().withGraphFetched("creator(simpleWithImage)");

    if (is_active !== undefined) {
      query = query.where("is_active", is_active === "true");
    }

    const pergubs = await query.modify("withRulesCount").orderBy("created_at", "desc");

    res.json(pergubs);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get single Pergub with rules
 */
const getPergub = async (req, res) => {
  try {
    const { pergubId } = req?.query;

    const pergub = await Pergub.query()
      .findById(pergubId)
      .withGraphFetched("[creator(simpleWithImage), rules(orderByPriority)]")
      .modifiers({
        orderByPriority(builder) {
          builder.orderBy("priority", "desc");
        },
      });

    if (!pergub) {
      return res.status(404).json({ message: "Pergub tidak ditemukan" });
    }

    res.json(pergub);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Create Pergub
 */
const createPergub = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const {
      name,
      regulation_number,
      description,
      file_url,
      effective_date,
      expired_date,
    } = req?.body;

    if (!name || !regulation_number) {
      return res
        .status(400)
        .json({ message: "Nama dan nomor regulasi wajib diisi" });
    }

    const pergub = await Pergub.query().insert({
      name,
      regulation_number,
      description,
      file_url,
      effective_date,
      expired_date,
      is_active: true,
      created_by: userId,
    });

    res.status(201).json(pergub);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update Pergub
 */
const updatePergub = async (req, res) => {
  try {
    const { pergubId } = req?.query;
    const {
      name,
      regulation_number,
      description,
      file_url,
      effective_date,
      expired_date,
      is_active,
    } = req?.body;

    const pergub = await Pergub.query().findById(pergubId);

    if (!pergub) {
      return res.status(404).json({ message: "Pergub tidak ditemukan" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (regulation_number !== undefined)
      updateData.regulation_number = regulation_number;
    if (description !== undefined) updateData.description = description;
    if (file_url !== undefined) updateData.file_url = file_url;
    if (effective_date !== undefined) updateData.effective_date = effective_date;
    if (expired_date !== undefined) updateData.expired_date = expired_date;
    if (is_active !== undefined) updateData.is_active = is_active;

    const updated = await Pergub.query().patchAndFetchById(pergubId, updateData);

    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete Pergub
 */
const deletePergub = async (req, res) => {
  try {
    const { pergubId } = req?.query;

    const pergub = await Pergub.query().findById(pergubId);

    if (!pergub) {
      return res.status(404).json({ message: "Pergub tidak ditemukan" });
    }

    // Get all rules to delete from Qdrant
    const rules = await PergubRules.query()
      .where("pergub_id", pergubId)
      .whereNotNull("qdrant_point_id");

    // Delete from Qdrant
    for (const rule of rules) {
      await deleteRuleVector(rule.qdrant_point_id);
    }

    // Delete Pergub (will cascade to rules)
    await Pergub.query().deleteById(pergubId);

    res.json({ message: "Pergub berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

// =====================
// PERGUB RULES CRUD
// =====================

/**
 * Get rules for Pergub
 */
const getPergubRules = async (req, res) => {
  try {
    const { pergubId } = req?.query;
    const { rule_type, is_active } = req?.query;

    let query = PergubRules.query().where("pergub_id", pergubId);

    if (rule_type) {
      query = query.where("rule_type", rule_type);
    }

    if (is_active !== undefined) {
      query = query.where("is_active", is_active === "true");
    }

    const rules = await query.orderBy("priority", "desc");

    res.json(rules);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get single rule
 */
const getPergubRule = async (req, res) => {
  try {
    const { ruleId } = req?.query;

    const rule = await PergubRules.query()
      .findById(ruleId)
      .withGraphFetched("pergub");

    if (!rule) {
      return res.status(404).json({ message: "Aturan tidak ditemukan" });
    }

    res.json(rule);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Create Pergub Rule with Qdrant sync
 */
const createPergubRule = async (req, res) => {
  try {
    const { pergubId } = req?.query;
    const {
      rule_type,
      rule_title,
      rule_content,
      example,
      counter_example,
      priority = 0,
    } = req?.body;

    // Validate required fields
    if (!rule_type || !rule_title || !rule_content) {
      return res
        .status(400)
        .json({ message: "Tipe, judul, dan konten aturan wajib diisi" });
    }

    // Check Pergub exists
    const pergub = await Pergub.query().findById(pergubId);
    if (!pergub) {
      return res.status(404).json({ message: "Pergub tidak ditemukan" });
    }

    // Create rule
    const rule = await PergubRules.query().insert({
      pergub_id: pergubId,
      rule_type,
      rule_title,
      rule_content,
      example,
      counter_example,
      priority,
      is_active: true,
    });

    // Generate embedding and sync to Qdrant
    if (process.env.QDRANT_ENABLED === "true") {
      try {
        const textToEmbed = `${rule_title}\n\n${rule_content}`;
        const embeddingResult = await generateEmbedding(textToEmbed);

        if (embeddingResult.success) {
          const qdrantResult = await upsertRuleVector(rule.id, embeddingResult.data, {
            pergub_id: pergubId,
            rule_type,
            rule_title,
            is_active: true,
            priority,
          });

          if (qdrantResult.success) {
            await PergubRules.query()
              .findById(rule.id)
              .patch({ qdrant_point_id: qdrantResult.data });
          }
        }
      } catch (qdrantError) {
        console.warn("Failed to sync to Qdrant:", qdrantError.message);
      }
    }

    res.status(201).json(rule);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update Pergub Rule with Qdrant sync
 */
const updatePergubRule = async (req, res) => {
  try {
    const { ruleId } = req?.query;
    const {
      rule_type,
      rule_title,
      rule_content,
      example,
      counter_example,
      priority,
      is_active,
    } = req?.body;

    const rule = await PergubRules.query().findById(ruleId);

    if (!rule) {
      return res.status(404).json({ message: "Aturan tidak ditemukan" });
    }

    const updateData = {};
    if (rule_type !== undefined) updateData.rule_type = rule_type;
    if (rule_title !== undefined) updateData.rule_title = rule_title;
    if (rule_content !== undefined) updateData.rule_content = rule_content;
    if (example !== undefined) updateData.example = example;
    if (counter_example !== undefined) updateData.counter_example = counter_example;
    if (priority !== undefined) updateData.priority = priority;
    if (is_active !== undefined) updateData.is_active = is_active;

    const updated = await PergubRules.query().patchAndFetchById(ruleId, updateData);

    // Re-sync to Qdrant if content changed
    if (
      process.env.QDRANT_ENABLED === "true" &&
      (rule_title || rule_content)
    ) {
      try {
        const textToEmbed = `${updated.rule_title}\n\n${updated.rule_content}`;
        const embeddingResult = await generateEmbedding(textToEmbed);

        if (embeddingResult.success) {
          const qdrantResult = await upsertRuleVector(
            updated.id,
            embeddingResult.data,
            {
              pergub_id: updated.pergub_id,
              rule_type: updated.rule_type,
              rule_title: updated.rule_title,
              is_active: updated.is_active,
              priority: updated.priority,
            }
          );

          if (qdrantResult.success && !updated.qdrant_point_id) {
            await PergubRules.query()
              .findById(ruleId)
              .patch({ qdrant_point_id: qdrantResult.data });
          }
        }
      } catch (qdrantError) {
        console.warn("Failed to sync to Qdrant:", qdrantError.message);
      }
    }

    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete Pergub Rule
 */
const deletePergubRule = async (req, res) => {
  try {
    const { ruleId } = req?.query;

    const rule = await PergubRules.query().findById(ruleId);

    if (!rule) {
      return res.status(404).json({ message: "Aturan tidak ditemukan" });
    }

    // Delete from Qdrant
    if (rule.qdrant_point_id && process.env.QDRANT_ENABLED === "true") {
      try {
        await deleteRuleVector(rule.qdrant_point_id);
      } catch (qdrantError) {
        console.warn("Failed to delete from Qdrant:", qdrantError.message);
      }
    }

    await PergubRules.query().deleteById(ruleId);

    res.json({ message: "Aturan berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Bulk sync rules to Qdrant
 */
const bulkSyncToQdrant = async (req, res) => {
  try {
    const { pergubId } = req?.query;
    const { force = false } = req?.body;

    let query = PergubRules.query().where("is_active", true);

    if (pergubId) {
      query = query.where("pergub_id", pergubId);
    }

    if (!force) {
      query = query.whereNull("qdrant_point_id");
    }

    const rules = await query;

    if (rules.length === 0) {
      return res.json({
        message: "Semua aturan sudah di-sync",
        synced: 0,
        failed: 0,
      });
    }

    let synced = 0;
    let failed = 0;

    for (const rule of rules) {
      try {
        const textToEmbed = `${rule.rule_title}\n\n${rule.rule_content}`;
        const embeddingResult = await generateEmbedding(textToEmbed);

        if (embeddingResult.success) {
          const qdrantResult = await upsertRuleVector(
            rule.id,
            embeddingResult.data,
            {
              pergub_id: rule.pergub_id,
              rule_type: rule.rule_type,
              rule_title: rule.rule_title,
              is_active: rule.is_active,
              priority: rule.priority,
            }
          );

          if (qdrantResult.success) {
            await PergubRules.query()
              .findById(rule.id)
              .patch({ qdrant_point_id: qdrantResult.data });
            synced++;
          } else {
            failed++;
          }
        } else {
          failed++;
        }
      } catch (err) {
        console.error(`Failed to sync rule ${rule.id}:`, err.message);
        failed++;
      }
    }

    res.json({
      message: `Sync selesai`,
      total: rules.length,
      synced,
      failed,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get rule types
 */
const getRuleTypes = async (req, res) => {
  try {
    const ruleTypes = [
      { value: "format", label: "Format Dokumen" },
      { value: "bahasa", label: "Tata Bahasa" },
      { value: "struktur", label: "Struktur Naskah" },
      { value: "kop_surat", label: "Kop Surat" },
      { value: "penomoran", label: "Penomoran" },
      { value: "tanda_tangan", label: "Tanda Tangan" },
      { value: "lampiran", label: "Lampiran" },
      { value: "lainnya", label: "Lainnya" },
    ];

    res.json(ruleTypes);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  // Pergub
  getPergubs,
  getPergub,
  createPergub,
  updatePergub,
  deletePergub,
  // Pergub Rules
  getPergubRules,
  getPergubRule,
  createPergubRule,
  updatePergubRule,
  deletePergubRule,
  bulkSyncToQdrant,
  getRuleTypes,
};

