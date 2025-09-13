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
    const revision = await KnowledgeContentVersions.query()
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
    await KnowledgeContentVersions.query()
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
      .andWhere("author_id", customId)
      .orderBy("version", "desc")
      .first();

    if (!lastRevisionDraft) {
      res.json(null);
    }

    // Verify user owns the original content
    const originalContent = await KnowledgeContent.query()
      .findById(id)
      .where("author_id", customId);

    if (!originalContent) {
      res.json(null);
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
 * Get all pending revisions for admin review with comprehensive filters
 * GET /api/knowledge/admin/revisions/pending
 *
 * Supports filtering by:
 * - search: search in title, summary, content
 * - status: all revision statuses (pending_revision, revision_rejected, draft, published)
 * - category_id: filter by category
 * - type: filter by content type (teks, gambar, video, audio)
 * - tag/tags: filter by tags
 * - sort: sorting options (created_at, updated_at, likes_count, etc.)
 *
 * Returns data with comprehensive counts like admin content system
 */
export const getPendingRevisions = async (req, res) => {
  try {
    // Extract all possible filters from query parameters - same as getKnowledgeContentsAdmin
    const filters = {
      search: req?.query?.search || "",
      page: parseInt(req?.query?.page) || 1,
      limit: parseInt(req?.query?.limit) || 10,
      category_id: req?.query?.category_id || req?.query?.categoryId || "",
      status: req?.query?.status || "pending_revision",
      type: req?.query?.type || "",
      sort: req?.query?.sort || "updated_at:desc",
      tag: req?.query?.tag,
      tags: req?.query?.tags,
      author_id: req?.query?.author_id || "",
    };

    // Process tags from string to array (same as admin content)
    const tagFilters = Array.isArray(filters.tag)
      ? filters.tag
      : filters.tag
      ? [filters.tag]
      : [];
    const allTags = filters.tags ? filters.tags.split(",").filter(Boolean) : [];
    const finalTags = [...new Set([...tagFilters, ...allTags])].filter(Boolean);

    // Build base query with all filters
    let query = KnowledgeContentVersions.query().select(
      "knowledge.content_versions.id",
      "knowledge.content_versions.content_id",
      "knowledge.content_versions.title",
      "knowledge.content_versions.summary",
      "knowledge.content_versions.author_id",
      "knowledge.content_versions.category_id",
      "knowledge.content_versions.type",
      "knowledge.content_versions.source_url",
      "knowledge.content_versions.status",
      "knowledge.content_versions.reason",
      "knowledge.content_versions.change_summary",
      "knowledge.content_versions.references",
      "knowledge.content_versions.attachments",
      "knowledge.content_versions.views_count",
      "knowledge.content_versions.likes_count",
      "knowledge.content_versions.comments_count",
      "knowledge.content_versions.bookmarks_count",
      "knowledge.content_versions.estimated_reading_time",
      "knowledge.content_versions.reading_complexity",
      "knowledge.content_versions.verified_by",
      "knowledge.content_versions.tags",
      "knowledge.content_versions.created_at",
      "knowledge.content_versions.updated_at",
      "knowledge.content_versions.version"
    );

    // Revision-specific status filtering
    const revisionStatuses = [
      "published",
      "pending_revision",
      "approve_revision",
      "reject_revision",
    ];

    if (filters.status && filters.status !== "all") {
      query = query.where("status", filters.status);
    } else {
      // Show all revision-related statuses when no specific status
      query = query.whereIn("status", revisionStatuses);
    }

    // Search filter - search in title, summary, and content
    if (filters.search) {
      query = query.andWhere((builder) => {
        builder
          .where(
            "knowledge.content_versions.title",
            "ilike",
            `%${filters.search}%`
          )
          .orWhere(
            "knowledge.content_versions.summary",
            "ilike",
            `%${filters.search}%`
          )
          .orWhere(
            "knowledge.content_versions.content",
            "ilike",
            `%${filters.search}%`
          );
      });
    }

    // Category filter
    if (filters.category_id) {
      query = query.andWhere(
        "knowledge.content_versions.category_id",
        filters.category_id
      );
    }

    // Author filter
    if (filters.author_id) {
      query = query.andWhere(
        "knowledge.content_versions.author_id",
        filters.author_id
      );
    }

    // Type filter (teks, gambar, video, audio)
    if (filters.type && filters.type !== "all") {
      if (filters.type === "teks") {
        query = query.andWhere((builder) => {
          builder
            .whereNull("knowledge.content_versions.type")
            .orWhere("knowledge.content_versions.type", "teks");
        });
      } else {
        query = query.andWhere("knowledge.content_versions.type", filters.type);
      }
    }

    // Tags filter
    if (finalTags && finalTags.length > 0) {
      query = query.andWhere((builder) => {
        finalTags.forEach((tag) => {
          builder.orWhereRaw(
            "JSON_CONTAINS(LOWER(CAST(knowledge.content_versions.tags AS CHAR)), LOWER(?))",
            [`"${tag}"`]
          );
        });
      });
    }

    // Apply sorting (same logic as admin content)
    const [sortField = "updated_at", sortDirection = "desc"] =
      filters.sort.split(":");
    const validSortFields = [
      "created_at",
      "updated_at",
      "likes_count",
      "comments_count",
      "views_count",
      "title",
      "version",
    ];
    const finalSortField = validSortFields.includes(sortField)
      ? sortField
      : "updated_at";
    const finalSortDirection = sortDirection === "asc" ? "asc" : "desc";

    // Handle null values in sorting for count fields
    let orderByClause;
    if (
      [
        "likes_count",
        "comments_count",
        "views_count",
        "bookmarks_count",
      ].includes(finalSortField)
    ) {
      orderByClause = KnowledgeContentVersions.raw(
        `COALESCE(knowledge.content_versions.${finalSortField}, 0) ${finalSortDirection.toUpperCase()}`
      );
    } else {
      orderByClause = [
        `knowledge.content_versions.${finalSortField}`,
        finalSortDirection,
      ];
    }

    // Execute paginated query with relations
    const revisions = await query
      .withGraphFetched("[author(simpleWithImage), category]")
      .orderByRaw(
        Array.isArray(orderByClause)
          ? `${orderByClause[0]} ${orderByClause[1]}`
          : orderByClause
      )
      .page(filters.page - 1, filters.limit);

    // Get revision-specific status counts
    const statusCounts = await KnowledgeContentVersions.query()
      .select("status")
      .count("id as total")
      .whereIn("status", revisionStatuses)
      .groupBy("status")
      .then((results) => {
        const counts = {
          all: 0,
          published: 0,
          pending_revision: 0,
          approve_revision: 0,
          reject_revision: 0,
        };
        results.forEach((result) => {
          const count = parseInt(result.total);
          counts[result.status] = count;
          counts.all += count;
        });
        return counts;
      });

    // Get type counts for revision content
    const typeCounts = await KnowledgeContentVersions.query()
      .select(
        KnowledgeContentVersions.raw(
          "COALESCE(type, 'teks') as type_normalized"
        ),
        KnowledgeContentVersions.raw("COUNT(*) as count")
      )
      .whereIn("status", revisionStatuses)
      .groupBy(KnowledgeContentVersions.raw("COALESCE(type, 'teks')"))
      .then((results) => {
        const counts = {
          all: 0,
          teks: 0,
          gambar: 0,
          video: 0,
          audio: 0,
        };
        results.forEach((result) => {
          const type = result.type_normalized;
          const count = parseInt(result.count);
          if (counts.hasOwnProperty(type)) {
            counts[type] = count;
            counts.all += count;
          }
        });
        return counts;
      });

    // Get category counts for revision content
    const categoryCounts = await KnowledgeContentVersions.query()
      .leftJoin(
        "knowledge.category",
        "knowledge.content_versions.category_id",
        "knowledge.category.id"
      )
      .select(
        "knowledge.category.id as category_id",
        "knowledge.category.name as category_name",
        KnowledgeContentVersions.raw("COUNT(*) as count")
      )
      .whereIn("knowledge.content_versions.status", revisionStatuses)
      .groupBy("knowledge.category.id", "knowledge.category.name")
      .then((results) => {
        const counts = {};
        let total = 0;
        results.forEach((result) => {
          const categoryId = result.category_id;
          const count = parseInt(result.count);
          if (categoryId) {
            counts[categoryId] = count;
            total += count;
          }
        });
        counts.all = total;
        return counts;
      });

    // Return comprehensive response matching admin content format
    const result = {
      data: revisions.results,
      total: revisions.total,
      page: filters.page,
      limit: filters.limit,
      statusCounts,
      typeCounts,
      categoryCounts,
      stats: {
        total_revisions: revisions.total,
        ...statusCounts,
      },
    };

    res.json(result);
  } catch (error) {
    console.error("Error in getPendingRevisions:", error);
    handleError(res, error);
  }
};

/**
 * Approve or reject a revision
 * POST /api/knowledge/admin/revisions/[versionId]/approve
 */
export const approveRevision = async (req, res) => {
  try {
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
