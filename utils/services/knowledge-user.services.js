const KnowledgeContent = require("@/models/knowledge/contents.model");
import { calculateReadingTime } from "./knowledge-content.services";

// ===== UTILITY FUNCTIONS =====

/**
 * Get sort field for content ordering
 */
export const getSortField = (sort) => {
  switch (sort) {
    case "created_at": // Default - tanggal create terbaru
    case "created_at_asc": // Tanggal create terlama
      return "created_at";
    case "likes_count": // Total like terbanyak
      return "likes_count";
    case "comments_count": // Total komentar terbanyak
      return "comments_count";
    case "title_asc": // Judul A-Z
    case "title_desc": // Judul Z-A
      return "title";
    case "updated_at": // Tanggal update
      return "updated_at";
    default:
      return "created_at";
  }
};

/**
 * Get sort direction for content ordering
 */
export const getSortDirection = (sort) => {
  switch (sort) {
    case "created_at_asc": // Tanggal create terlama (ASC)
    case "title_asc": // Judul A-Z (ASC)
      return "asc";
    case "title_desc": // Judul Z-A (DESC)
      return "desc";
    case "created_at": // Default - tanggal create terbaru (DESC)
    case "likes_count": // Total like terbanyak (DESC)
    case "comments_count": // Total komentar terbanyak (DESC)
    case "updated_at": // Tanggal update terbaru (DESC)
    default:
      return "desc";
  }
};

/**
 * Build user interaction subqueries for content
 */
export const buildUserInteractionSubqueries = (customId, includeInteractions = true) => {
  if (!includeInteractions) return [];
  
  return [
    // Subquery for is_liked
    KnowledgeContent.relatedQuery("user_interactions")
      .where("user_id", customId)
      .where("interaction_type", "like")
      .select(
        KnowledgeContent.raw(
          "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
        )
      )
      .as("is_liked"),
    // Subquery for is_bookmarked
    KnowledgeContent.relatedQuery("user_interactions")
      .where("user_id", customId)
      .where("interaction_type", "bookmark")
      .select(
        KnowledgeContent.raw(
          "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
        )
      )
      .as("is_bookmarked")
  ];
};

// ===== CONTENT QUERY SERVICES =====

/**
 * Get user's single knowledge content with full details
 */
export const getUserKnowledgeContentById = async (contentId, customId) => {
  const content = await KnowledgeContent.query()
    .where("knowledge.contents.id", contentId)
    .withGraphFetched(
      "[author(simpleWithImage), category, user_verified(simpleWithImage), versions.[user_updated(simpleWithImage)], attachments, references]"
    )
    .select(
      "knowledge.contents.*",
      ...buildUserInteractionSubqueries(customId)
    )
    .first();

  return content;
};

/**
 * Build query for user's knowledge contents with filters
 */
export const buildUserContentQuery = (customId, filters = {}) => {
  const {
    search = "",
    category_id = "",
    tags = [],
    status = "",
    type = "",
    sort = "created_at"
  } = filters;

  let query = KnowledgeContent.query()
    .where("knowledge.contents.author_id", customId);

  // Search filter
  if (search) {
    query = query.andWhere((builder) => {
      builder
        .where("title", "ilike", `%${search}%`)
        .orWhere("content", "ilike", `%${search}%`);
    });
  }

  // Category filter
  if (category_id) {
    query = query.andWhere("category_id", category_id);
  }

  // Tags filter
  if (tags && tags.length > 0) {
    query = query.andWhere((builder) => {
      tags.forEach((tag) => {
        builder.orWhereRaw("tags @> ?", [JSON.stringify([tag])]);
      });
    });
  }

  // Status filter
  if (status) {
    query = query.andWhere("status", status);
  }

  // Type filter
  if (type && type !== "all") {
    query = query.andWhere("type", type);
  }

  return query;
};

/**
 * Get user's knowledge contents with pagination and filters
 */
export const getUserKnowledgeContents = async (customId, filters = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = "created_at",
    tags = "",
    is_liked = "",
    is_bookmarked = ""
  } = filters;

  // Process tags
  const tagFilters = Array.isArray(filters.tag)
    ? filters.tag
    : filters.tag
    ? [filters.tag]
    : [];
  const allTags = tags ? tags.split(",").filter(Boolean) : [];
  const finalTags = [...new Set([...tagFilters, ...allTags])].filter(Boolean);

  // Build query
  const baseQuery = buildUserContentQuery(customId, {
    ...filters,
    tags: finalTags
  });

  // Execute paginated query with interactions
  const contents = await baseQuery
    .select(
      "knowledge.contents.id",
      "knowledge.contents.title",
      "knowledge.contents.summary",
      "knowledge.contents.author_id",
      "knowledge.contents.category_id",
      "knowledge.contents.type",
      "knowledge.contents.source_url",
      "knowledge.contents.status",
      "knowledge.contents.tags",
      "knowledge.contents.likes_count",
      "knowledge.contents.comments_count",
      "knowledge.contents.views_count",
      "knowledge.contents.bookmarks_count",
      "knowledge.contents.created_at",
      "knowledge.contents.updated_at",
      ...buildUserInteractionSubqueries(customId)
    )
    .withGraphFetched(
      "[author(simpleWithImage), category, user_verified(simpleWithImage)]"
    )
    .orderBy(getSortField(sort), getSortDirection(sort))
    .page(page - 1, limit);

  // Apply post-query filters for interaction-based filtering
  if (is_liked === "true" || is_bookmarked === "true") {
    contents.results = contents.results.filter((content) => {
      let match = true;
      if (is_liked === "true" && !content.is_liked) match = false;
      if (is_bookmarked === "true" && !content.is_bookmarked) match = false;
      return match;
    });
  }

  return {
    data: contents?.results,
    total: contents?.total,
    page: contents?.page + 1 || 1,
    limit: contents?.limit || 10,
  };
};

// ===== STATISTICS SERVICES =====

/**
 * Get user's content status counts
 */
export const getUserContentStatusCounts = async (customId) => {
  const results = await KnowledgeContent.query()
    .where("knowledge.contents.author_id", customId)
    .groupBy("status")
    .select("status")
    .count("* as count");

  const counts = {
    all: 0,
    draft: 0,
    pending: 0,
    published: 0,
    rejected: 0,
    archived: 0,
  };

  results.forEach((result) => {
    const status = result.status;
    const count = parseInt(result.count);
    counts[status] = count;
    counts.all += count;
  });

  return counts;
};

/**
 * Get user's content type counts
 */
export const getUserContentTypeCounts = async (customId) => {
  const results = await KnowledgeContent.query()
    .where("knowledge.contents.author_id", customId)
    .groupBy("type")
    .select("type")
    .count("* as count");

  const counts = {
    all: 0,
    teks: 0,
    gambar: 0,
    video: 0,
    audio: 0,
  };

  results.forEach((result) => {
    const type = result.type || "teks"; // Default to teks if null
    const count = parseInt(result.count);
    counts[type] = count;
    counts.all += count;
  });

  return counts;
};

/**
 * Get user's content engagement statistics
 */
export const getUserEngagementStats = async (customId) => {
  const stats = await KnowledgeContent.query()
    .where("knowledge.contents.author_id", customId)
    .select(
      KnowledgeContent.raw("COALESCE(SUM(likes_count), 0) as total_likes"),
      KnowledgeContent.raw("COALESCE(SUM(comments_count), 0) as total_comments"),
      KnowledgeContent.raw("COALESCE(SUM(views_count), 0) as total_views")
    )
    .first();

  return {
    total_likes: parseInt(stats?.total_likes || 0),
    total_comments: parseInt(stats?.total_comments || 0),
    total_views: parseInt(stats?.total_views || 0),
  };
};

/**
 * Get comprehensive user knowledge statistics
 */
export const getUserKnowledgeStats = async (customId) => {
  const [statusCounts, typeCounts, engagementStats] = await Promise.all([
    getUserContentStatusCounts(customId),
    getUserContentTypeCounts(customId),
    getUserEngagementStats(customId)
  ]);

  return {
    statusCounts,
    typeCounts,
    stats: {
      ...engagementStats,
      ...statusCounts,
    },
  };
};

/**
 * Get user contents with full statistics (used by getUserKnowledgeContents controller)
 */
export const getUserContentsWithStats = async (customId, filters = {}) => {
  const [contents, statusCounts, typeCounts, engagementStats] = await Promise.all([
    getUserKnowledgeContents(customId, filters),
    getUserContentStatusCounts(customId),
    getUserContentTypeCounts(customId),
    getUserEngagementStats(customId)
  ]);

  return {
    ...contents,
    statusCounts,
    typeCounts,
    stats: {
      ...engagementStats,
      ...statusCounts,
    },
  };
};

// ===== CONTENT MANAGEMENT SERVICES =====

/**
 * Submit user's draft content for review
 */
export const submitContentForReview = async (contentId, customId) => {
  // Verify user owns the content and it's in draft status
  const content = await KnowledgeContent.query()
    .findById(contentId)
    .where("author_id", customId)
    .where("status", "draft");

  if (!content) {
    throw new Error("Content not found, access denied, or content is not in draft status");
  }

  // Update status to pending
  const updatedContent = await KnowledgeContent.query()
    .findById(contentId)
    .patch({
      status: "pending",
      updated_at: new Date(),
    });

  return updatedContent;
};

/**
 * Update user's draft content
 */
export const editUserContent = async (contentId, contentData, customId) => {
  const readingTime = calculateReadingTime(contentData.content, contentData.summary);
  
  const updateData = {
    ...contentData,
    tags: JSON.stringify(contentData.tags || []),
    estimated_reading_time: readingTime,
    updated_at: new Date(),
  };

  // Verify user owns the content and it's editable (draft or rejected)
  const content = await KnowledgeContent.query()
    .findById(contentId)
    .where("author_id", customId)
    .whereIn("status", ["draft", "rejected"]);

  if (!content) {
    throw new Error("Content not found, access denied, or content cannot be edited");
  }

  return await KnowledgeContent.transaction(async (trx) => {
    // Update content
    await KnowledgeContent.query(trx)
      .findById(contentId)
      .patch(updateData);

    // Handle references if provided
    if (contentData.references !== undefined) {
      await content.$relatedQuery("references", trx).delete();
      if (contentData.references && contentData.references.length > 0) {
        await content.$relatedQuery("references", trx).insert(
          contentData.references.map(ref => ({
            title: ref.title,
            url: ref.url
          }))
        );
      }
    }

    // Return updated content with relations
    return await KnowledgeContent.query(trx)
      .findById(contentId)
      .withGraphFetched("[references, category, author(simpleWithImage)]");
  });
};

/**
 * Delete user's content (soft delete by changing status to archived)
 */
export const deleteUserContent = async (contentId, customId) => {
  // Verify user owns the content
  const content = await KnowledgeContent.query()
    .findById(contentId)
    .where("author_id", customId);

  if (!content) {
    throw new Error("Content not found or access denied");
  }

  // Check if content can be deleted (not published)
  if (content.status === "published") {
    throw new Error("Published content cannot be deleted. Please contact administrator.");
  }

  // Soft delete by setting status to archived
  const result = await KnowledgeContent.query()
    .findById(contentId)
    .patch({ 
      status: "archived",
      updated_at: new Date(),
    });

  return result;
};