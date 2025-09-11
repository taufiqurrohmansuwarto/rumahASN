const KnowledgeContent = require("@/models/knowledge/contents.model");
const KnowledgeContentVersions = require("@/models/knowledge/content-versions.model");

import { handleError } from "@/utils/helper/controller-helper";
import { awardXP } from "./gamification.controller";
import { processContentWithAI } from "@/utils/services/ai-processing.services";
import { getEncryptedUserId } from "@/utils/services/knowledge-content.services";
import { uploadFileMinio } from "@/utils/index";
import { uploadContentAttachmentRevision } from "@/utils/services/knowledge-revisions.services";
const { nanoid } = require("nanoid");

// ===== USER REVISION CONTROLLERS =====

/**
 * Create a new revision from published content
 * POST /api/knowledge/users/me/contents/[id]/create-revision
 */
export const createRevision = async (req, res) => {
  try {
    const { id } = req.query;
    const { customId } = req.user;

    // Get the published content
    const publishedContent = await KnowledgeContent.query()
      .findById(id)
      .where("author_id", customId)
      .where("status", "published");

    if (!publishedContent) {
      return res.status(404).json({
        message:
          "Konten yang dipublikasikan tidak ditemukan atau Anda tidak memiliki izin",
      });
    }

    // Check if there's already a pending revision using FK
    const existingRevision = await KnowledgeContentVersions.query()
      .where("author_id", customId)
      .andWhere("content_id", publishedContent.id)
      .andWhere("version", publishedContent.current_version + 1)
      .andWhere("status", "draft")
      .first();

    if (existingRevision) {
      return res.status(409).json({
        message:
          "Anda sudah memiliki revisi yang sedang dalam tahap pengerjaan",
        revisionId: existingRevision.id,
      });
    }

    const lastRevision = await KnowledgeContentVersions.query()
      .where("content_id", id)
      .andWhere("status", "published")
      .orderBy("version", "desc")
      .first();

    // Create new revision
    const newRevision = await KnowledgeContent.transaction(async (trx) => {
      // Create revision content
      const revisionData = {
        title: lastRevision.title,
        content_id: id,
        content: lastRevision.content,
        summary: lastRevision.summary,
        source_url: lastRevision.source_url,
        type: lastRevision.type,
        tags: JSON.stringify(lastRevision.tags || []),
        category_id: lastRevision.category_id,
        updated_by: customId,
        version: (lastRevision?.version || 0) + 1,
        status: "draft",
        reason: `Revision created from published content: ${lastRevision.title}`, // Descriptive reason
        views_count: lastRevision.views_count,
        likes_count: lastRevision.likes_count,
        comments_count: lastRevision.comments_count,
        bookmarks_count: lastRevision.bookmarks_count,
        estimated_reading_time: lastRevision.estimated_reading_time,
        reading_complexity: lastRevision.reading_complexity,
        verified_by: lastRevision.verified_by,
        author_id: lastRevision.author_id,
        attachments: JSON.stringify(lastRevision.attachments || []),
        references: JSON.stringify(lastRevision.references || []),
      };

      // Create initial version snapshot with complete data
      const revision = await KnowledgeContentVersions.query(trx)
        .insert(revisionData)
        .returning("id");

      return revision;
    });

    res.status(201).json({
      message: "Revision created successfully",
      revision: newRevision,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update revision content
 * PUT /api/knowledge/users/me/contents/[id]/revisions/[versionId]
 */
export const updateRevision = async (req, res) => {
  try {
    const { id, versionId } = req.query;
    const { customId } = req.user;
    const payload = req.body;

    const { references } = payload;

    if (references?.length > 0) {
      const referencesData = references.map((reference) => ({
        id: nanoid(),
        title: reference.title,
        url: reference.url,
      }));
      payload.references = referencesData;
    }

    // Find the revision
    const revision = await KnowledgeContentVersions.query()
      .where("author_id", customId)
      .where("id", versionId)
      .where("content_id", id)
      .where("status", "draft");

    if (!revision) {
      return res.status(404).json({
        message: "Revision not found or cannot be edited",
      });
    }

    // Update revision
    const updatedRevision = await KnowledgeContentVersions.transaction(
      async (trx) => {
        const updateData = {
          title: payload.title,
          content: payload.content,
          summary: payload.summary,
          type: payload.type,
          source_url: payload.source_url,
          references: JSON.stringify(payload.references || []),
          tags: JSON.stringify(payload.tags || []),
          category_id: payload.category_id,
          updated_at: new Date(),
        };

        await KnowledgeContentVersions.query(trx)
          .findById(versionId)
          .patch(updateData);

        return await KnowledgeContentVersions.query(trx).findById(versionId);
      }
    );

    res.json({
      message: "Revision updated successfully",
      revision: updatedRevision,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Submit revision for admin review
 * POST /api/knowledge/users/me/contents/[id]/revisions/[versionId]/submit
 */
export const submitRevision = async (req, res) => {
  try {
    const { versionId } = req.query;
    const { customId } = req.user;
    const { submitNotes } = req.body;

    // Find the revision
    const revision = await KnowledgeContent.query()
      .findById(versionId)
      .where("author_id", customId)
      .where("status", "draft");

    if (!revision) {
      return res.status(404).json({
        message: "Revision not found or already submitted",
      });
    }

    // Validate required fields
    if (!revision.title || !revision.content) {
      return res.status(400).json({
        message: "Title and content are required before submission",
      });
    }

    // Submit for review
    await KnowledgeContent.query()
      .findById(versionId)
      .patch({
        status: "pending_revision",
        reason: `${revision.reason || ""} | Submit notes: ${
          submitNotes || ""
        } | Submitted at: ${new Date().toISOString()}`,
        updated_at: new Date(),
      });

    res.json({
      message: "Revision submitted for review successfully",
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get user's revisions for a specific content
 * GET /api/knowledge/users/me/contents/[id]/revisions
 */
export const getMyRevisions = async (req, res) => {
  try {
    const { id } = req.query;
    const { customId } = req.user;

    const lastRevisionDraft = await KnowledgeContentVersions.query()
      .where("content_id", id)
      .andWhere("status", "draft")
      .orderBy("version", "desc")
      .first();

    if (!lastRevisionDraft) {
      return res.status(404).json({
        message: "No draft revision found",
      });
    }

    // Verify user owns the original content
    const originalContent = await KnowledgeContent.query()
      .findById(id)
      .where("author_id", customId);

    if (!originalContent) {
      return res.status(404).json({
        message: "Content not found or access denied",
      });
    }

    // Get all revisions except v1
    const revisions = await KnowledgeContentVersions.query()
      .where("author_id", customId)
      .where("content_id", id)
      .andWhereNot("version", 1)
      .orderBy("version", "desc");

    res.json({
      originalContent: {
        id: originalContent.id,
        title: originalContent.title,
        status: originalContent.status,
        current_version: originalContent.current_version,
      },
      revisions,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ===== ADMIN REVISION CONTROLLERS =====

/**
 * Get all pending revisions for admin review
 * GET /api/knowledge/admin/revisions/pending
 */
export const getPendingRevisions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category_id, author_id } = req.query;

    const revisions = await KnowledgeContent.query()
      .where("status", "pending_revision")
      .andWhere((builder) => {
        if (category_id) {
          builder.where("category_id", category_id);
        }
        if (author_id) {
          builder.where("author_id", author_id);
        }
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
      })
      .select(
        "knowledge.contents.id",
        "knowledge.contents.title",
        "knowledge.contents.summary",
        "knowledge.contents.author_id",
        "knowledge.contents.original_author_id",
        "knowledge.contents.category_id",
        "knowledge.contents.current_version",
        "knowledge.contents.status",
        "knowledge.contents.data",
        "knowledge.contents.revision_from_content_id",
        "knowledge.contents.created_at",
        "knowledge.contents.updated_at"
      )
      .withGraphFetched(
        "[author(simpleWithImage), original_author(simpleWithImage), category, versions.[user_updated(simpleWithImage)]]"
      )
      .orderBy("updated_at", "desc")
      .page(page - 1, limit);

    // Get status counts
    const statusCounts = await KnowledgeContent.query()
      .select("status")
      .count("id as total")
      .whereIn("status", ["pending_revision", "revision_rejected"])
      .groupBy("status")
      .then((results) => {
        const counts = { pending_revision: 0, revision_rejected: 0 };
        results.forEach((result) => {
          counts[result.status] = parseInt(result.total);
        });
        return counts;
      });

    // Use FK for original content ID, parse reason for submit notes only
    const processedRevisions = revisions.results.map((revision) => {
      const submitNotesMatch = revision.reason?.match(/Submit notes: ([^|]+)/);

      return {
        ...revision,
        submitNotes: submitNotesMatch ? submitNotesMatch[1].trim() : null,
        originalContentId: revision.revision_from_content_id, // Use FK instead of parsing
      };
    });

    const result = {
      data: processedRevisions,
      total: revisions.total,
      page: parseInt(page),
      limit: parseInt(limit),
      statusCounts,
    };

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Approve or reject a revision
 * POST /api/knowledge/admin/revisions/[versionId]/approve
 */
export const approveRevision = async (req, res) => {
  try {
    const { versionId } = req.query;
    const { customId } = req.user;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    // Find the revision
    const revision = await KnowledgeContent.query()
      .findById(versionId)
      .where("status", "pending_revision");

    if (!revision) {
      return res.status(404).json({
        message: "Revision not found or not pending review",
      });
    }

    // Get original content ID from FK
    const originalContentId = revision.revision_from_content_id;

    if (!originalContentId) {
      return res.status(400).json({
        message: "Invalid revision: missing original content reference",
      });
    }

    const result = await KnowledgeContent.transaction(async (trx) => {
      if (action === "approve") {
        // Get the original content
        const originalContent = await KnowledgeContent.query(trx).findById(
          originalContentId
        );

        if (!originalContent) {
          throw new Error("Original content not found");
        }

        // Replace original content with revision data
        await KnowledgeContent.query(trx)
          .findById(originalContentId)
          .patch({
            title: revision.title,
            content: revision.content,
            summary: revision.summary,
            source_url: revision.source_url,
            tags: JSON.stringify(revision.tags || "[]"),
            category_id: revision.category_id,
            current_version: revision.current_version,
            verified_by: customId,
            verified_at: new Date(),
            updated_at: new Date(),
          });

        // Copy references from revision to original
        const revisionReferences = await revision.$relatedQuery(
          "references",
          trx
        );

        // Always delete old references and insert new ones (even if empty)
        await KnowledgeContent.relatedQuery("references", trx)
          .for(originalContentId)
          .delete();

        if (revisionReferences.length > 0) {
          await KnowledgeContent.relatedQuery("references", trx)
            .for(originalContentId)
            .insert(
              revisionReferences.map((ref) => ({
                title: ref.title,
                url: ref.url,
              }))
            );
        }

        // Copy attachments from revision to original
        const revisionAttachments = await revision.$relatedQuery(
          "attachments",
          trx
        );

        // Always delete old attachments and insert new ones (even if empty)
        await KnowledgeContent.relatedQuery("attachments", trx)
          .for(originalContentId)
          .delete();

        if (revisionAttachments.length > 0) {
          await KnowledgeContent.relatedQuery("attachments", trx)
            .for(originalContentId)
            .insert(
              revisionAttachments.map((att) => ({
                filename: att.filename,
                file_path: att.file_path,
                file_size: att.file_size,
                file_type: att.file_type,
                url: att.url,
              }))
            );
        }

        // Update revision status to approved (keep for history/audit trail)
        await KnowledgeContent.query(trx).findById(versionId).patch({
          status: "revision_approved",
          verified_by: customId,
          verified_at: new Date(),
        });

        // Create version snapshot for updated original content with complete data
        await KnowledgeContentVersions.query(trx).insert({
          content_id: originalContentId,
          version: revision.current_version,
          title: revision.title,
          content: revision.content,
          summary: revision.summary,
          tags: JSON.stringify(revision?.tags || "[]"),
          category_id: revision.category_id,
          type: revision.type,
          source_url: revision.source_url,
          status: "published",
          updated_by: customId,
          change_summary: `Revision approved and applied from version ${versionId}`,
          reason: "Content updated via approved revision",
          // Store complete references and attachments data in approved version
          references: JSON.stringify(
            revisionReferences.map((ref) => ({
              title: ref.title,
              url: ref.url,
            }))
          ),
          attachments: JSON.stringify(
            revisionAttachments.map((att) => ({
              filename: att.filename,
              file_path: att.file_path,
              file_size: att.file_size,
              file_type: att.file_type,
              url: att.url,
            }))
          ),
        });

        // Award XP to author
        try {
          await awardXP({
            userId: revision.author_id,
            action: "revision_approved",
            refType: "content",
            refId: originalContentId,
            xp: 15,
          });
        } catch (xpError) {
          console.warn("Failed to award XP for approved revision:", xpError);
        }

        // Trigger AI processing for updated content
        setImmediate(async () => {
          try {
            await processContentWithAI(originalContentId);
          } catch (aiError) {
            console.error(
              `AI processing failed for revised content ${originalContentId}:`,
              aiError.message
            );
          }
        });

        return { action: "approved", contentId: originalContentId };
      } else if (action === "reject") {
        // Update revision status to rejected
        await KnowledgeContent.query(trx)
          .findById(versionId)
          .patch({
            status: "revision_rejected",
            verified_by: customId,
            verified_at: new Date(),
            reason: `${revision.reason || ""} | Rejection: ${
              rejectionReason || "No reason provided"
            } | Rejected at: ${new Date().toISOString()}`,
          });

        return { action: "rejected", revisionId: versionId };
      } else {
        throw new Error("Invalid action. Use 'approve' or 'reject'");
      }
    });

    res.json({
      message: `Revision ${result.action} successfully`,
      ...result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get revision details with comparison
 * GET /api/knowledge/admin/revisions/[versionId]
 */
export const getRevisionDetails = async (req, res) => {
  try {
    const { versionId, id } = req.query;
    const { customId } = req.user; // Get current user from auth middleware

    const lastRevisionDraft = await KnowledgeContentVersions.query()
      .where("id", versionId)
      .where("author_id", customId)
      .where("content_id", id)
      .withGraphFetched("[author(simpleWithImage), category]")
      .first();

    if (!lastRevisionDraft) {
      return res.status(404).json({
        message: "No draft revision found",
      });
    }

    res.json(lastRevisionDraft);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get all revisions for a specific content (Admin view)
 * GET /api/knowledge/admin/contents/[id]/revisions
 */
export const getAdminContentRevisions = async (req, res) => {
  try {
    const { id } = req.query;

    // First verify the content exists
    const originalContent = await KnowledgeContent.query()
      .findById(id)
      .select("id", "title", "status", "current_version", "author_id")
      .withGraphFetched("author(simpleWithImage)");

    if (!originalContent) {
      return res.status(404).json({
        message: "Content not found",
      });
    }

    // Get all content versions (revisions) from content_versions table
    const revisions = await KnowledgeContentVersions.query()
      .where("content_id", id)
      .withGraphFetched("user_updated(simpleWithImage)")
      .orderBy("version", "desc");

    // Process revisions for admin view
    const processedRevisions = revisions.map((revision) => ({
      id: revision.id,
      version: revision.version,
      title: revision.title,
      summary: revision.summary,
      status: revision.status,
      type: revision.type,
      source_url: revision.source_url,
      tags: revision.tags,
      category_id: revision.category_id,
      content_id: revision.content_id,
      updated_by: revision.updated_by,
      user_updated: revision.user_updated,
      created_at: revision.created_at,
      updated_at: revision.updated_at,
      change_notes: revision.change_summary,
      review_notes: revision.reason,
    }));

    const response = {
      content: {
        id: originalContent.id,
        title: originalContent.title,
        status: originalContent.status,
        current_version: originalContent.current_version,
        author: originalContent.author,
      },
      revisions: processedRevisions,
      total: processedRevisions.length,
      pending_count: processedRevisions.filter(
        (r) => r.status === "pending_revision"
      ).length,
      approved_count: processedRevisions.filter((r) => r.status === "published")
        .length,
      rejected_count: processedRevisions.filter(
        (r) => r.status === "revision_rejected"
      ).length,
    };

    res.json(response);
  } catch (error) {
    handleError(res, error);
  }
};

export const uploadContentMediaRevision = async (req, res) => {
  try {
    const { mc } = req;
    const { customId } = req?.user;
    const { id: contentId, versionId } = req.query;
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: "File media is required" });
    }

    const content = await KnowledgeContentVersions.query()
      .findById(versionId)
      .where("content_id", contentId)
      .where("author_id", customId)
      .where("status", "draft");

    if (!content || content.author_id !== customId) {
      return res
        .status(404)
        .json({ message: "Content not found or access denied" });
    }

    // Validate file type for media
    const allowedTypes = ["image/", "video/", "audio/"];
    if (!allowedTypes.some((type) => file.mimetype.startsWith(type))) {
      return res.status(400).json({
        message:
          "Invalid file type. Only image, video, and audio files are allowed",
      });
    }

    // Generate unique filename using service
    const timestamp = new Date().getTime();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const encryptedUserId = getEncryptedUserId(customId);
    const fileName = `knowledge-media/${encryptedUserId}/${timestamp}_${originalName}`;

    // Upload to MinIO
    await uploadFileMinio(mc, file.buffer, fileName, file.size, file.mimetype);

    const mediaUrl = `https://siasn.bkd.jatimprov.go.id:9000/public/${fileName}`;

    // Determine content type based on file mimetype
    const contentType = file.mimetype.startsWith("image/")
      ? "gambar"
      : file.mimetype.startsWith("video/")
      ? "video"
      : "audio";

    // Update content with media URL
    const updatedContent =
      await KnowledgeContentVersions.query().patchAndFetchById(versionId, {
        type: contentType,
        source_url: mediaUrl,
        updated_at: new Date(),
      });

    res.json({
      success: true,
      message: "Media uploaded and content updated successfully",
      data: {
        content: updatedContent,
        media: {
          url: mediaUrl,
          filename: fileName,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          type: contentType,
        },
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const uploadRevisionAttachments = async (req, res) => {
  try {
    const files = req?.files || [];
    const mc = req?.mc;
    const { versionId } = req?.query;
    const { customId } = req?.user;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file yang diunggah",
      });
    }

    // Use service to upload attachments
    const result = await uploadContentAttachmentRevision(
      versionId,
      files,
      customId,
      mc
    );

    // Transform response to match expected format
    const uploadResults = result.attachments.map((attachment) => ({
      id: attachment.content_version_id,
      uid: `attachment-${attachment.content_version_id}`,
      name: attachment.name,
      filename: attachment.name,
      url: attachment.url,
      size: attachment.size,
      mime: attachment.mime,
      mimetype: attachment.mime,
      status: "done",
    }));

    const hasil = {
      success: true,
      message: result.message,
      data: {
        attachments: uploadResults,
      },
    };

    console.log(hasil);

    res.json(hasil);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteRevisionAttachment = async (req, res) => {
  try {
    const { uploadId, versionId } = req.query;
    const { customId } = req.user;

    console.log(uploadId, versionId);

    const revision = await KnowledgeContentVersions.query()
      .where("id", versionId)
      .where("author_id", customId)
      .first();

    if (!revision) {
      return res.status(404).json({
        success: false,
        message: "Revisi tidak ditemukan",
      });
    }

    // Parse attachments if it's a string
    let attachments = revision.attachments;
    if (typeof attachments === "string") {
      try {
        attachments = JSON.parse(attachments);
      } catch (e) {
        attachments = [];
      }
    }

    if (!Array.isArray(attachments)) {
      attachments = [];
    }

    const filteredAttachments = attachments.filter(
      (attachment) => attachment.id !== uploadId
    );

    await KnowledgeContentVersions.query()
      .patch({ attachments: JSON.stringify(filteredAttachments) })
      .where("id", versionId);

    res.json({
      success: true,
      message: "File berhasil dihapus",
    });
  } catch (error) {
    handleError(res, error);
  }
};
