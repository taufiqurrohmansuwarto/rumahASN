const KnowledgeContent = require("@/models/knowledge/contents.model");
const KnowledgeContentVersions = require("@/models/knowledge/content-versions.model");
const KnowledgeUserInteractions = require("@/models/knowledge/user-interactions.model");

const XpLog = require("@/models/knowledge/xp-log.model");
const UserPoints = require("@/models/knowledge/user-points.model");
const UserBadges = require("@/models/knowledge/user-badges.model");
const UserMissions = require("@/models/knowledge/user-mission-progress.model");

import { handleError } from "@/utils/helper/controller-helper";
import { awardXP } from "./gamification.controller";
import { processContentWithAI } from "@/utils/services/ai-processing.services";

export const getKnowledgeContentsAdmin = async (req, res) => {
  try {
    // default filter adalah draft
    const {
      search,
      page = 1,
      limit = 10,
      categoryId,
      status = "pending",
    } = req?.query;

    const contents = await KnowledgeContent.query()
      .where("status", status)
      .andWhere((builder) => {
        if (categoryId) {
          builder.where("category_id", categoryId);
        }
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
      })
      .select(
        "knowledge.contents.id",
        "knowledge.contents.type",
        "knowledge.contents.source_url",
        "knowledge.contents.title",
        "knowledge.contents.summary",
        "knowledge.contents.author_id",
        "knowledge.contents.category_id",
        "knowledge.contents.status",
        "knowledge.contents.tags",
        "knowledge.contents.likes_count",
        "knowledge.contents.comments_count",
        "knowledge.contents.views_count",
        "knowledge.contents.bookmarks_count",
        "knowledge.contents.created_at",
        "knowledge.contents.updated_at",
        "knowledge.contents.verified_by",
        "knowledge.contents.verified_at"
      )
      .withGraphFetched(
        "[author(simpleWithImage), category, user_verified(simpleWithImage)]"
      )
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    const totalPending = await KnowledgeContent.query()
      .where("status", "pending")
      .count("id as total");

    const totalPublished = await KnowledgeContent.query()
      .where("status", "published")
      .count("id as total");

    const totalRejected = await KnowledgeContent.query()
      .where("status", "rejected")
      .count("id as total");

    const totalArchived = await KnowledgeContent.query()
      .where("status", "archived")
      .count("id as total");

    const result = {
      data: contents.results,
      total: contents.total,
      page: parseInt(page),
      limit: parseInt(limit),
      statusCounts: {
        pending: parseInt(totalPending[0].total),
        published: parseInt(totalPublished[0].total),
        rejected: parseInt(totalRejected[0].total),
        archived: parseInt(totalArchived[0].total),
      },
    };

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getKnowledgeContentAdmin = async (req, res) => {
  try {
    const { id } = req?.query;
    const content = await KnowledgeContent.query()
      .findById(id)
      .withGraphFetched(
        "[author(simpleWithImage), category, user_verified(simpleWithImage), versions.[user_updated(simpleWithImage)], attachments, references]"
      );

    const comments = await KnowledgeUserInteractions.query()
      .where("content_id", id)
      .andWhere("interaction_type", "comment")
      .withGraphFetched("user(simpleWithImage)")
      .orderBy("created_at", "desc");

    if (!content) {
      res.status(404).json({
        message: "Content not found",
      });
    } else {
      const data = {
        ...content,
        comments,
      };

      res.json(data);
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const updateKnowledgeContentAdmin = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const payload = req?.body;

    const data = {
      ...payload,
      tags: JSON.stringify(payload?.tags || []),
      updated_at: new Date(),
    };

    // Menggunakan transaction untuk memastikan konsistensi data
    const content = await KnowledgeContent.transaction(async (trx) => {
      // Ambil content yang akan diupdate
      const existingContent = await KnowledgeContent.query(trx).findById(id);

      if (!existingContent) {
        throw new Error("Content tidak ditemukan");
      }

      // update increment version
      const contentVersion = await KnowledgeContentVersions.query(trx)
        .where("content_id", id)
        .orderBy("version", "desc")
        .first();

      const version = contentVersion ? contentVersion.version + 1 : 1;

      await KnowledgeContentVersions.query(trx).insert({
        content_id: id,
        version,
        updated_by: customId,
      });

      // Update content terlebih dahulu
      await KnowledgeContent.query(trx).findById(id).patch(data);

      // Handle references secara terpisah
      if (payload?.references !== undefined) {
        // Hapus semua references yang ada
        await existingContent.$relatedQuery("references", trx).delete();

        // Insert references baru jika ada
        if (payload.references && payload.references.length > 0) {
          await existingContent.$relatedQuery("references", trx).insert(
            payload.references.map((reference) => ({
              title: reference.title,
              url: reference.url,
            }))
          );
        }
      }

      // Ambil content yang sudah diupdate dengan relations
      const result = await KnowledgeContent.query(trx)
        .findById(id)
        .withGraphFetched("[references]");

      return result;
    });

    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

export const changeStatusKnowledgeContentAdmin = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const payload = req?.body;

    // Get current content untuk cek author dan status sebelumnya
    const currentContent = await KnowledgeContent.query().findById(id);

    if (!currentContent) {
      return res.status(404).json({ message: "Content tidak ditemukan" });
    }

    const data = {
      ...payload,
      verified_by: customId,
      verified_at: new Date(),
    };

    const content = await KnowledgeContent.query().where("id", id).patch(data);

    // Award XP jika content di-approve menjadi "published" (+10 XP untuk author)
    if (
      payload.status === "published" &&
      currentContent.status !== "published"
    ) {
      try {
        await awardXP({
          userId: currentContent.author_id,
          action: "publish_content",
          refType: "content",
          refId: id,
          xp: 10,
        });
      } catch (xpError) {
        console.warn("Failed to award XP for published content:", xpError);
      }

      // Trigger AI processing when content is published
      setImmediate(async () => {
        try {
          console.log(`Triggering AI processing for published content: ${id}`);
          await processContentWithAI(id);
          console.log(`AI processing completed for published content: ${id}`);
        } catch (aiError) {
          console.error(`AI processing failed for content ${id}:`, aiError.message);
          // Don't throw error - AI processing failure shouldn't affect status change
        }
      });
    }

    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteKnowledgeContentAdmin = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    await KnowledgeContent.query()
      .findById(id)
      .update({ status: "archive", updated_by: customId });

    res.json({ message: "Content deleted successfully" });
  } catch (error) {
    handleError(res, error);
  }
};

export const flushContent = async (req, res) => {
  try {
    await KnowledgeContent.query().delete();
    await XpLog.query().delete();
    await UserPoints.query().delete();
    await UserBadges.query().delete();
    await UserMissions.query().delete();
    res.json({ message: "Content flushed successfully" });
  } catch (error) {
    handleError(res, error);
  }
};
