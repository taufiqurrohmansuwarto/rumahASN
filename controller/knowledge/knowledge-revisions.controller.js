const KnowledgeContent = require("@/models/knowledge/contents.model");
const KnowledgeContentVersions = require("@/models/knowledge/content-versions.model");

import { handleError } from "@/utils/helper/controller-helper";
import { awardXP } from "./gamification.controller";
import { processContentWithAI } from "@/utils/services/ai-processing.services";

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
        message: "Published content not found or you don't have permission"
      });
    }

    // Check if there's already a pending revision
    // We'll use a simple approach: check by author and title pattern
    const existingRevision = await KnowledgeContent.query()
      .where("author_id", customId)
      .where("id", "!=", id)
      .whereIn("status", ["draft", "pending_revision"])
      .where("title", "like", `%${publishedContent.title}%`)
      .first();

    if (existingRevision) {
      return res.status(409).json({
        message: "You already have a pending revision for this content",
        revisionId: existingRevision.id
      });
    }

    // Create new revision
    const newRevision = await KnowledgeContent.transaction(async (trx) => {
      // Create revision content
      const revisionData = {
        title: publishedContent.title,
        content: publishedContent.content,
        summary: publishedContent.summary,
        source_url: publishedContent.source_url,
        type: publishedContent.type,
        tags: publishedContent.tags,
        category_id: publishedContent.category_id,
        author_id: customId,
        original_author_id: customId,
        current_version: (publishedContent.current_version || 1) + 1,
        status: "draft",
        reason: `Revision of content: ${id}` // Use reason field to track original
      };

      const revision = await KnowledgeContent.query(trx).insert(revisionData);

      // Create initial version snapshot
      await KnowledgeContentVersions.query(trx).insert({
        content_id: revision.id,
        version: 1,
        title: revisionData.title,
        content: revisionData.content, // content field in versions
        summary: revisionData.summary,
        tags: revisionData.tags,
        category_id: revisionData.category_id,
        type: revisionData.type,
        source_url: revisionData.source_url,
        status: 'draft',
        updated_by: customId,
        change_summary: "Initial revision created",
        reason: "Revision created from published content"
      });

      return revision;
    });

    res.status(201).json({
      message: "Revision created successfully",
      revision: newRevision
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
    const { versionId } = req.query;
    const { customId } = req.user;
    const payload = req.body;

    // Find the revision
    const revision = await KnowledgeContent.query()
      .findById(versionId)
      .where("author_id", customId)
      .where("status", "draft");

    if (!revision) {
      return res.status(404).json({
        message: "Revision not found or cannot be edited"
      });
    }

    // Update revision
    const updatedRevision = await KnowledgeContent.transaction(async (trx) => {
      const updateData = {
        title: payload.title,
        content: payload.content,
        summary: payload.summary,
        source_url: payload.source_url,
        tags: JSON.stringify(payload.tags),
        category_id: payload.category_id,
        updated_at: new Date()
      };

      await KnowledgeContent.query(trx).findById(versionId).patch(updateData);

      // Create new version snapshot
      const latestVersion = await KnowledgeContentVersions.query(trx)
        .where("content_id", versionId)
        .orderBy("version", "desc")
        .first();

      await KnowledgeContentVersions.query(trx).insert({
        content_id: versionId,
        version: (latestVersion?.version || 0) + 1,
        title: payload.title,
        content: payload.content,
        summary: payload.summary,
        tags: payload.tags,
        category_id: payload.category_id,
        type: revision.type,
        source_url: payload.source_url,
        status: 'draft',
        updated_by: customId,
        change_summary: payload.changeNotes || "Content updated",
        reason: "Revision content modified"
      });

      // Handle references
      if (payload.references !== undefined) {
        await revision.$relatedQuery("references", trx).delete();
        if (payload.references && payload.references.length > 0) {
          await revision.$relatedQuery("references", trx).insert(
            payload.references.map(ref => ({
              title: ref.title,
              url: ref.url
            }))
          );
        }
      }

      return await KnowledgeContent.query(trx)
        .findById(versionId)
        .withGraphFetched("[references]");
    });

    res.json({
      message: "Revision updated successfully",
      revision: updatedRevision
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
        message: "Revision not found or already submitted"
      });
    }

    // Validate required fields
    if (!revision.title || !revision.content) {
      return res.status(400).json({
        message: "Title and content are required before submission"
      });
    }

    // Submit for review
    await KnowledgeContent.query()
      .findById(versionId)
      .patch({
        status: "pending_revision",
        reason: `${revision.reason || ""} | Submit notes: ${submitNotes || ""} | Submitted at: ${new Date().toISOString()}`,
        updated_at: new Date()
      });

    res.json({
      message: "Revision submitted for review successfully"
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

    // Verify user owns the original content
    const originalContent = await KnowledgeContent.query()
      .findById(id)
      .where("author_id", customId);

    if (!originalContent) {
      return res.status(404).json({
        message: "Content not found or access denied"
      });
    }

    // Get all revisions for this content by checking reason field
    const revisions = await KnowledgeContent.query()
      .where("author_id", customId)
      .where("reason", "like", `%Revision of content: ${id}%`)
      .withGraphFetched("[versions.[user_updated(simpleWithImage)], category]")
      .orderBy("created_at", "desc");

    res.json({
      originalContent: {
        id: originalContent.id,
        title: originalContent.title,
        status: originalContent.status,
        current_version: originalContent.current_version
      },
      revisions
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
    const {
      page = 1,
      limit = 10,
      search,
      category_id,
      author_id
    } = req.query;

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
      .then(results => {
        const counts = { pending_revision: 0, revision_rejected: 0 };
        results.forEach(result => {
          counts[result.status] = parseInt(result.total);
        });
        return counts;
      });

    // Parse reason field for submit notes and original content ID
    const processedRevisions = revisions.results.map(revision => {
      const reasonMatch = revision.reason?.match(/Revision of content: ([^\s|]+)/);
      const submitNotesMatch = revision.reason?.match(/Submit notes: ([^|]+)/);
      
      return {
        ...revision,
        submitNotes: submitNotesMatch ? submitNotesMatch[1].trim() : null,
        originalContentId: reasonMatch ? reasonMatch[1] : null
      };
    });

    const result = {
      data: processedRevisions,
      total: revisions.total,
      page: parseInt(page),
      limit: parseInt(limit),
      statusCounts
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
        message: "Revision not found or not pending review"
      });
    }

    // Extract original content ID from reason field
    const reasonMatch = revision.reason?.match(/Revision of content: ([^\s|]+)/);
    const originalContentId = reasonMatch ? reasonMatch[1] : null;

    if (!originalContentId) {
      return res.status(400).json({
        message: "Invalid revision: missing original content reference"
      });
    }

    const result = await KnowledgeContent.transaction(async (trx) => {
      if (action === "approve") {
        // Get the original content
        const originalContent = await KnowledgeContent.query(trx)
          .findById(originalContentId);

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
            tags: revision.tags,
            category_id: revision.category_id,
            current_version: revision.current_version,
            verified_by: customId,
            verified_at: new Date(),
            updated_at: new Date()
          });

        // Copy references from revision to original
        const revisionReferences = await revision.$relatedQuery("references", trx);
        if (revisionReferences.length > 0) {
          await KnowledgeContent.query(trx)
            .findById(originalContentId)
            .$relatedQuery("references", trx)
            .delete();
          
          await KnowledgeContent.query(trx)
            .findById(originalContentId)
            .$relatedQuery("references", trx)
            .insert(revisionReferences.map(ref => ({
              title: ref.title,
              url: ref.url
            })));
        }

        // Update revision status to published (so it shows in history)
        await KnowledgeContent.query(trx)
          .findById(versionId)
          .patch({
            status: "published",
            verified_by: customId,
            verified_at: new Date()
          });

        // Create version snapshot for updated original content
        await KnowledgeContentVersions.query(trx).insert({
            content_id: originalContentId,
          version: revision.current_version,
          title: revision.title,
          content: revision.content,
          summary: revision.summary,
          tags: revision.tags,
          category_id: revision.category_id,
          type: revision.type,
          source_url: revision.source_url,
          status: 'published',
          updated_by: customId,
          change_summary: `Revision approved and applied from version ${versionId}`,
          reason: "Content updated via approved revision"
        });

        // Award XP to author
        try {
          await awardXP({
            userId: revision.author_id,
            action: "revision_approved",
            refType: "content",
            refId: originalContentId,
            xp: 15
          });
        } catch (xpError) {
          console.warn("Failed to award XP for approved revision:", xpError);
        }

        // Trigger AI processing for updated content
        setImmediate(async () => {
          try {
            await processContentWithAI(originalContentId);
          } catch (aiError) {
            console.error(`AI processing failed for revised content ${originalContentId}:`, aiError.message);
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
            reason: `${revision.reason || ""} | Rejection: ${rejectionReason || "No reason provided"} | Rejected at: ${new Date().toISOString()}`
          });

        return { action: "rejected", revisionId: versionId };
      } else {
        throw new Error("Invalid action. Use 'approve' or 'reject'");
      }
    });

    res.json({
      message: `Revision ${result.action} successfully`,
      ...result
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
    const { versionId } = req.query;

    // Get the revision
    const revision = await KnowledgeContent.query()
      .findById(versionId)
      .withGraphFetched(
        "[author(simpleWithImage), category, versions.[user_updated(simpleWithImage)], references]"
      );

    if (!revision) {
      return res.status(404).json({
        message: "Revision not found"
      });
    }

    // Extract original content ID from reason field
    const reasonMatch = revision.reason?.match(/Revision of content: ([^\s|]+)/);
    const originalContentId = reasonMatch ? reasonMatch[1] : null;

    let originalContent = null;
    if (originalContentId) {
      originalContent = await KnowledgeContent.query()
        .findById(originalContentId)
        .withGraphFetched("[references]");
    }

    // Extract data from reason field
    const submitNotesMatch = revision.reason?.match(/Submit notes: ([^|]+)/);
    const submittedAtMatch = revision.reason?.match(/Submitted at: ([^|]+)/);
    const rejectionReasonMatch = revision.reason?.match(/Rejection: ([^|]+)/);

    res.json({
      revision: {
        ...revision,
        submitNotes: submitNotesMatch ? submitNotesMatch[1].trim() : null,
        submittedAt: submittedAtMatch ? submittedAtMatch[1].trim() : null,
        rejectionReason: rejectionReasonMatch ? rejectionReasonMatch[1].trim() : null
      },
      originalContent
    });

  } catch (error) {
    handleError(res, error);
  }
};