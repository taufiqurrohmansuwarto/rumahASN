/**
 * Reviews Controller - RASN Naskah
 * AI-powered document review with Qdrant + OpenAI
 */

const { handleError } = require("@/utils/helper/controller-helper");
const Documents = require("@/models/rasn-naskah/documents.model");
const DocumentReviews = require("@/models/rasn-naskah/document-reviews.model");
const ReviewIssues = require("@/models/rasn-naskah/review-issues.model");
const DocumentActivities = require("@/models/rasn-naskah/document-activities.model");

// Import queue for background processing
const { addDocumentReviewJob } = require("@/jobs/queue");

/**
 * Request AI review for document
 * This creates a pending review and adds job to queue
 * Supports targeting specific user preferences for AI review
 */
const requestReview = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { documentId } = req?.query;
    const { targetUserId, targetSuperiorId } = req?.body || {};

    console.log(`📝 [REVIEW] Request body:`, req?.body);
    console.log(`📝 [REVIEW] Target User ID: ${targetUserId}, Target Superior ID: ${targetSuperiorId}`);

    const document = await Documents.query().findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    if (document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    // Check if document has content
    const contentToReview = document.content || document.extracted_text;
    if (!contentToReview) {
      return res.status(400).json({
        message: "Dokumen tidak memiliki konten untuk direview",
      });
    }

    // Check if there's already a pending/processing review
    const pendingReview = await DocumentReviews.query()
      .where("document_id", documentId)
      .whereIn("status", ["pending", "processing"])
      .first();

    if (pendingReview) {
      // Check if review is stuck (older than 10 minutes)
      const createdAt = new Date(pendingReview.created_at);
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      
      if (createdAt < tenMinutesAgo) {
        // Review is stuck, cancel it and create new one
        await DocumentReviews.query()
          .findById(pendingReview.id)
          .patch({
            status: "failed",
            error_message: "Review timeout - dibuat ulang secara otomatis",
          });
        
        console.log(`⚠️ [REVIEW] Auto-cancelled stuck review: ${pendingReview.id}`);
      } else {
        return res.status(400).json({
          message: "Dokumen sedang dalam proses review",
          review_id: pendingReview.id,
          job_id: pendingReview.job_id,
          created_at: pendingReview.created_at,
        });
      }
    }

    // Get latest version
    const latestVersion = await document.getLatestVersion();

    // Create review record
    const review = await DocumentReviews.query().insert({
      document_id: documentId,
      document_version_id: latestVersion?.id || null,
      original_content: contentToReview,
      status: "pending",
    });

    // Update document status
    await Documents.query()
      .findById(documentId)
      .patch({ status: "pending_review" });

    // Add job to queue for background processing
    let jobId = null;
    try {
      const job = await addDocumentReviewJob(documentId, review.id, {
        userId,
        priority: 0,
        targetUserId: targetUserId || null,
        targetSuperiorId: targetSuperiorId || null,
      });
      jobId = job?.id || null;

      // Update review with job_id
      if (jobId) {
        await DocumentReviews.query()
          .findById(review.id)
          .patch({ job_id: jobId });
      }
    } catch (queueError) {
      console.error("Failed to add job to queue:", queueError.message);
      // Continue without queue - review will be processed later
    }

    // Log activity
    await DocumentActivities.log(
      documentId,
      userId,
      "review_requested",
      {
        review_id: review.id,
        job_id: jobId,
        target_user_id: targetUserId || null,
        target_superior_id: targetSuperiorId || null,
      },
      targetUserId ? "Review AI diminta dengan preferensi target" : "Review AI diminta"
    );

    res.status(202).json({
      message: "Review sedang diproses",
      review_id: review.id,
      job_id: jobId,
      status: "pending",
      target_user_id: targetUserId || null,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get review status
 */
const getReviewStatus = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { reviewId } = req?.query;

    const review = await DocumentReviews.query()
      .findById(reviewId)
      .withGraphFetched("document");

    if (!review) {
      return res.status(404).json({ message: "Review tidak ditemukan" });
    }

    if (review.document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    res.json({
      id: review.id,
      status: review.status,
      job_id: review.job_id,
      score: review.score,
      total_issues: review.total_issues,
      error_message: review.error_message,
      created_at: review.created_at,
      updated_at: review.updated_at,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get review detail
 */
const getReview = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { reviewId } = req?.query;

    const review = await DocumentReviews.query()
      .findById(reviewId)
      .withGraphFetched("[document, issues(orderBySeverity)]")
      .modifiers({
        orderBySeverity(builder) {
          builder.orderByRaw(`
            CASE severity 
              WHEN 'critical' THEN 1 
              WHEN 'major' THEN 2 
              WHEN 'minor' THEN 3 
              WHEN 'suggestion' THEN 4 
            END
          `);
        },
      });

    if (!review) {
      return res.status(404).json({ message: "Review tidak ditemukan" });
    }

    if (review.document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    res.json(review);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get all reviews for document
 */
const getDocumentReviews = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { documentId } = req?.query;
    const { full } = req?.query; // Query param to get full review data

    const document = await Documents.query().findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    if (document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    let query = DocumentReviews.query()
      .where("document_id", documentId)
      .orderBy("created_at", "desc");

    if (full === "true") {
      // Return full review data with issues
      query = query.withGraphFetched("issues");
    } else {
      // Return only summary
      query = query.select(
        "id",
        "status",
        "score",
        "ai_summary",
        "ai_suggestions",
        "score_breakdown",
        "total_issues",
        "critical_issues",
        "major_issues",
        "minor_issues",
        "processing_time_ms",
        "created_at"
      );
    }

    const reviews = await query;

    res.json(reviews);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get review issues
 */
const getReviewIssues = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { reviewId } = req?.query;
    const { severity, category, resolved } = req?.query;

    const review = await DocumentReviews.query()
      .findById(reviewId)
      .withGraphFetched("document");

    if (!review) {
      return res.status(404).json({ message: "Review tidak ditemukan" });
    }

    if (review.document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    let query = ReviewIssues.query()
      .where("review_id", reviewId)
      .withGraphFetched("related_rule");

    if (severity) {
      query = query.where("severity", severity);
    }

    if (category) {
      query = query.where("category", category);
    }

    if (resolved !== undefined) {
      query = query.where("is_resolved", resolved === "true");
    }

    const issues = await query.modify("orderBySeverity");

    res.json(issues);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Mark issue as resolved
 */
const resolveIssue = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { issueId } = req?.query;

    const issue = await ReviewIssues.query()
      .findById(issueId)
      .withGraphFetched("review.document");

    if (!issue) {
      return res.status(404).json({ message: "Issue tidak ditemukan" });
    }

    if (issue.review.document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const resolved = await issue.resolve();

    res.json(resolved);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Bulk resolve issues
 */
const bulkResolveIssues = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { issue_ids } = req?.body;

    if (!issue_ids || !Array.isArray(issue_ids) || issue_ids.length === 0) {
      return res.status(400).json({ message: "Issue IDs wajib diisi" });
    }

    // Verify ownership for all issues
    const issues = await ReviewIssues.query()
      .whereIn("id", issue_ids)
      .withGraphFetched("review.document");

    const unauthorized = issues.some(
      (issue) => issue.review.document.user_id !== userId
    );

    if (unauthorized) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    // Bulk update
    await ReviewIssues.query()
      .whereIn("id", issue_ids)
      .patch({ is_resolved: true });

    res.json({
      message: `${issue_ids.length} issue berhasil ditandai sebagai resolved`,
      resolved_count: issue_ids.length,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get review statistics for user
 */
const getReviewStats = async (req, res) => {
  try {
    const { customId: userId } = req?.user;

    // Get all user's documents
    const documents = await Documents.query()
      .where("user_id", userId)
      .select("id");

    const documentIds = documents.map((d) => d.id);

    if (documentIds.length === 0) {
      return res.json({
        total_reviews: 0,
        average_score: null,
        total_issues: 0,
        resolved_issues: 0,
      });
    }

    // Get review stats
    const reviews = await DocumentReviews.query()
      .whereIn("document_id", documentIds)
      .where("status", "completed");

    const totalReviews = reviews.length;
    const avgScore =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + (r.score || 0), 0) / totalReviews
        : null;
    const totalIssues = reviews.reduce((sum, r) => sum + (r.total_issues || 0), 0);

    // Get resolved issues count
    const reviewIds = reviews.map((r) => r.id);
    const [{ count: resolvedCount }] = await ReviewIssues.query()
      .whereIn("review_id", reviewIds)
      .where("is_resolved", true)
      .count();

    res.json({
      total_reviews: totalReviews,
      average_score: avgScore ? Math.round(avgScore * 10) / 10 : null,
      total_issues: totalIssues,
      resolved_issues: parseInt(resolvedCount),
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Cancel a pending/processing review
 */
const cancelReview = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { reviewId } = req?.query;

    const review = await DocumentReviews.query()
      .findById(reviewId)
      .withGraphFetched("document");

    if (!review) {
      return res.status(404).json({ message: "Review tidak ditemukan" });
    }

    if (review.document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    if (!["pending", "processing"].includes(review.status)) {
      return res.status(400).json({
        message: "Hanya review yang pending atau processing yang bisa dibatalkan",
      });
    }

    // Cancel the review
    await DocumentReviews.query().findById(reviewId).patch({
      status: "failed",
      error_message: "Review dibatalkan oleh pengguna",
    });

    // Reset document status
    await Documents.query()
      .findById(review.document_id)
      .patch({ status: "draft" });

    // Log activity
    // Note: "edited" is used as a generic action since "review_cancelled" is not in enum
    await DocumentActivities.log(
      review.document_id,
      userId,
      "edited",
      { review_id: reviewId, action_type: "review_cancelled" },
      "Review AI dibatalkan"
    );

    res.json({
      message: "Review berhasil dibatalkan",
      review_id: reviewId,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Retry a failed review
 */
const retryReview = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { reviewId } = req?.query;

    const review = await DocumentReviews.query()
      .findById(reviewId)
      .withGraphFetched("document");

    if (!review) {
      return res.status(404).json({ message: "Review tidak ditemukan" });
    }

    if (review.document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    if (review.status !== "failed") {
      return res.status(400).json({
        message: "Hanya review yang gagal yang bisa diulang",
      });
    }

    // Reset review to pending
    await DocumentReviews.query().findById(reviewId).patch({
      status: "pending",
      error_message: null,
      job_id: null,
    });

    // Update document status
    await Documents.query()
      .findById(review.document_id)
      .patch({ status: "pending_review" });

    // Add job to queue
    let jobId = null;
    try {
      const job = await addDocumentReviewJob(
        review.document_id,
        reviewId,
        { userId, priority: 0 }
      );
      jobId = job?.id || null;

      if (jobId) {
        await DocumentReviews.query()
          .findById(reviewId)
          .patch({ job_id: jobId });
      }
    } catch (queueError) {
      console.error("Failed to add retry job to queue:", queueError.message);
    }

    // Log activity
    // Note: "review_requested" is used for retry since "review_retried" is not in enum
    await DocumentActivities.log(
      review.document_id,
      userId,
      "review_requested",
      { review_id: reviewId, job_id: jobId, action_type: "review_retried" },
      "Review AI diulang"
    );

    res.json({
      message: "Review sedang diproses ulang",
      review_id: reviewId,
      job_id: jobId,
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  requestReview,
  getReviewStatus,
  getReview,
  getDocumentReviews,
  getReviewIssues,
  resolveIssue,
  bulkResolveIssues,
  getReviewStats,
  cancelReview,
  retryReview,
};

