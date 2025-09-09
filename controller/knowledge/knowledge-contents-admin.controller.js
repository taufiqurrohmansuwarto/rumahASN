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
import { createContentStatusNotification } from "@/utils/services/knowledge-notifications.services";
import { getAdminKnowledgeContentsWithStats } from "@/utils/services/knowledge-admin.services";

/**
 * Get admin knowledge contents with comprehensive filters and statistics
 * 
 * Supports filtering by:
 * - search: search in title, summary, content
 * - status: all admin statuses (draft, pending, published, rejected, archived, pending_revision, revision_rejected)
 * - category_id: filter by category
 * - type: filter by content type (teks, gambar, video, audio)
 * - tag/tags: filter by tags
 * - sort: sorting options (created_at, updated_at, likes_count, etc.)
 * 
 * Returns data with comprehensive counts like user bookmark system
 */
export const getKnowledgeContentsAdmin = async (req, res) => {
  try {
    // Extract all possible filters from query parameters
    // Default status is "pending" to show content needing review
    const filters = {
      search: req?.query?.search || "",
      page: parseInt(req?.query?.page) || 1,
      limit: parseInt(req?.query?.limit) || 10,
      category_id: req?.query?.category_id || req?.query?.categoryId || "", // Support both formats
      status: req?.query?.status || "pending",
      type: req?.query?.type || "",
      sort: req?.query?.sort || "created_at:desc",
      tag: req?.query?.tag, // Single tag or array of tags
      tags: req?.query?.tags, // Comma-separated tags string
    };

    // Use the comprehensive admin service to get data with all statistics
    // This includes statusCounts, typeCounts, categoryCounts like user system
    const result = await getAdminKnowledgeContentsWithStats(filters);

    // Return the complete response with all data and counts
    // Format matches user bookmark system for frontend consistency
    res.json(result);
    
  } catch (error) {
    console.error("Error in getKnowledgeContentsAdmin:", error);
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
      tags: payload?.tags || [], // Use array directly for JSONB
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

    // Create content status notification jika status berubah
    if (payload.status && payload.status !== currentContent.status) {
      try {
        await createContentStatusNotification(
          id, 
          customId, 
          currentContent.status, 
          payload.status,
          payload.rejection_reason || null
        );
      } catch (notifError) {
        console.warn("Failed to create content status notification:", notifError);
      }
    }

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
