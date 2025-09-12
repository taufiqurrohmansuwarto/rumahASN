const KnowledgeContent = require("@/models/knowledge/contents.model");
const KnowledgeUserInteraction = require("@/models/knowledge/user-interactions.model");
const KnowledgeContentAttachments = require("@/models/knowledge/content-attachments.model");
import { calculateReadingTime } from "./knowledge-content.services";

// ===== UTILITY FUNCTIONS =====

/**
 * Get sort field for content ordering
 */
export const getSortField = (sort) => {
  const [field] = sort.split(":");
  switch (field) {
    case "created_at":
      return "created_at";
    case "likes_count":
      return "likes_count";
    case "comments_count":
      return "comments_count";
    case "title":
      return "title";
    case "updated_at":
      return "updated_at";
    default:
      return "created_at";
  }
};

/**
 * Get sort direction for content ordering
 */
export const getSortDirection = (sort) => {
  const [, direction = "desc"] = sort.split(":");
  return direction === "asc" ? "asc" : "desc";
};

/**
 * Build user interaction subqueries for content
 */
export const buildUserInteractionSubqueries = (
  customId,
  includeInteractions = true
) => {
  if (!includeInteractions) return [];

  return [
    // More efficient subquery for is_liked using EXISTS
    KnowledgeContent.raw(
      `
      EXISTS(
        SELECT 1 FROM knowledge.user_interactions ui 
        WHERE ui.content_id = knowledge.contents.id 
        AND ui.user_id = ? 
        AND ui.interaction_type = 'like'
      ) as is_liked
    `,
      [customId]
    ),
    // More efficient subquery for is_bookmarked using EXISTS
    KnowledgeContent.raw(
      `
      EXISTS(
        SELECT 1 FROM knowledge.user_interactions ui 
        WHERE ui.content_id = knowledge.contents.id 
        AND ui.user_id = ? 
        AND ui.interaction_type = 'bookmark'
      ) as is_bookmarked
    `,
      [customId]
    ),
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
    .select("knowledge.contents.*", ...buildUserInteractionSubqueries(customId))
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
  } = filters;

  let query = KnowledgeContent.query().where(
    "knowledge.contents.author_id",
    customId
  );

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
  if (status && status !== "all") {
    query = query.andWhere("status", status);
  }

  // Type filter
  if (type && type !== "all") {
    if (type === "teks") {
      // For teks, include both 'teks' and null values
      query = query.andWhere((builder) => {
        builder.where("type", "teks").orWhereNull("type");
      });
    } else {
      query = query.andWhere("type", type);
    }
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
    sort = "created_at:desc",
    tags = "",
    is_liked = "",
    is_bookmarked = "",
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
    tags: finalTags,
  });

  // Sorting
  const sortField = getSortField(sort);
  const sortDirection = getSortDirection(sort);

  // Handle null values in sorting for count fields
  let orderByClause;
  if (
    [
      "likes_count",
      "comments_count",
      "views_count",
      "bookmarks_count",
    ].includes(sortField)
  ) {
    orderByClause = KnowledgeContent.raw(
      `COALESCE(knowledge.contents.${sortField}, 0) ${sortDirection.toUpperCase()}`
    );
  } else {
    orderByClause = [`knowledge.contents.${sortField}`, sortDirection];
  }

  // Execute paginated query with interactions
  const contents = await baseQuery
    .select(
      "knowledge.contents.id",
      "knowledge.contents.title",
      "knowledge.contents.summary",
      "knowledge.contents.author_id",
      "knowledge.contents.category_id",
      KnowledgeContent.raw("COALESCE(knowledge.contents.type, 'teks') as type"),
      "knowledge.contents.source_url",
      "knowledge.contents.status",
      "knowledge.contents.tags",
      KnowledgeContent.raw(
        "COALESCE(knowledge.contents.likes_count, 0) as likes_count"
      ),
      KnowledgeContent.raw(
        "COALESCE(knowledge.contents.comments_count, 0) as comments_count"
      ),
      KnowledgeContent.raw(
        "COALESCE(knowledge.contents.views_count, 0) as views_count"
      ),
      KnowledgeContent.raw(
        "COALESCE(knowledge.contents.bookmarks_count, 0) as bookmarks_count"
      ),
      "knowledge.contents.created_at",
      "knowledge.contents.updated_at",
      ...buildUserInteractionSubqueries(customId)
    )
    .withGraphFetched(
      "[author(simpleWithImage), category, user_verified(simpleWithImage)]"
    )
    .orderByRaw(
      Array.isArray(orderByClause)
        ? `${orderByClause[0]} ${orderByClause[1]}`
        : orderByClause
    )
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
    .select(
      KnowledgeContent.raw("COALESCE(type, 'teks') as type_normalized"),
      KnowledgeContent.raw("COUNT(*) as count")
    )
    .groupBy(KnowledgeContent.raw("COALESCE(type, 'teks')"));

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
      KnowledgeContent.raw(
        "COALESCE(SUM(comments_count), 0) as total_comments"
      ),
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
 * Get user's content category counts
 */
export const getUserContentCategoryCounts = async (customId) => {
  const results = await KnowledgeContent.query()
    .where("knowledge.contents.author_id", customId)
    .leftJoin(
      "knowledge.category",
      "knowledge.contents.category_id",
      "knowledge.category.id"
    )
    .select(
      "knowledge.category.id as category_id",
      "knowledge.category.name as category_name",
      KnowledgeContent.raw("COUNT(*) as count")
    )
    .groupBy("knowledge.category.id", "knowledge.category.name");

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
};

// ===== BOOKMARK STATISTICS SERVICES =====

/**
 * Get user's bookmarked content status counts
 */
export const getUserBookmarkStatusCounts = async (customId) => {
  const results = await KnowledgeContent.query()
    .innerJoin(
      "knowledge.user_interactions",
      "knowledge.contents.id",
      "knowledge.user_interactions.content_id"
    )
    .where("knowledge.user_interactions.user_id", customId)
    .where("knowledge.user_interactions.interaction_type", "bookmark")
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
 * Get user's bookmarked content type counts
 */
export const getUserBookmarkTypeCounts = async (customId) => {
  const results = await KnowledgeContent.query()
    .innerJoin(
      "knowledge.user_interactions",
      "knowledge.contents.id",
      "knowledge.user_interactions.content_id"
    )
    .where("knowledge.user_interactions.user_id", customId)
    .where("knowledge.user_interactions.interaction_type", "bookmark")
    .select(
      KnowledgeContent.raw("COALESCE(type, 'teks') as type_normalized"),
      KnowledgeContent.raw("COUNT(*) as count")
    )
    .groupBy(KnowledgeContent.raw("COALESCE(type, 'teks')"));

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
    counts[type] = count;
    counts.all += count;
  });

  return counts;
};

/**
 * Get user's bookmarked content category counts
 */
export const getUserBookmarkCategoryCounts = async (customId) => {
  const results = await KnowledgeContent.query()
    .innerJoin(
      "knowledge.user_interactions",
      "knowledge.contents.id",
      "knowledge.user_interactions.content_id"
    )
    .where("knowledge.user_interactions.user_id", customId)
    .where("knowledge.user_interactions.interaction_type", "bookmark")
    .leftJoin(
      "knowledge.category",
      "knowledge.contents.category_id",
      "knowledge.category.id"
    )
    .select(
      "knowledge.category.id as category_id",
      "knowledge.category.name as category_name",
      KnowledgeContent.raw("COUNT(*) as count")
    )
    .groupBy("knowledge.category.id", "knowledge.category.name");

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
};

/**
 * Get comprehensive user knowledge statistics
 */
export const getUserKnowledgeStats = async (customId) => {
  const [statusCounts, typeCounts, engagementStats, categoryCounts] =
    await Promise.all([
      getUserContentStatusCounts(customId),
      getUserContentTypeCounts(customId),
      getUserEngagementStats(customId),
      getUserContentCategoryCounts(customId),
    ]);

  return {
    statusCounts,
    typeCounts,
    categoryCounts,
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
  const [contents, statusCounts, typeCounts, engagementStats, categoryCounts] =
    await Promise.all([
      getUserKnowledgeContents(customId, filters),
      getUserContentStatusCounts(customId),
      getUserContentTypeCounts(customId),
      getUserEngagementStats(customId),
      getUserContentCategoryCounts(customId),
    ]);

  const data = {
    ...contents,
    statusCounts,
    typeCounts,
    categoryCounts,
    stats: {
      ...engagementStats,
      ...statusCounts,
    },
  };

  return data;
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
    throw new Error(
      "Content not found, access denied, or content is not in draft status"
    );
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
  const readingTime = calculateReadingTime(
    contentData.content,
    contentData.summary
  );

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
    throw new Error(
      "Content not found, access denied, or content cannot be edited"
    );
  }

  return await KnowledgeContent.transaction(async (trx) => {
    // Update content
    await KnowledgeContent.query(trx).findById(contentId).patch(updateData);

    // Handle references if provided
    if (contentData.references !== undefined) {
      await content.$relatedQuery("references", trx).delete();
      if (contentData.references && contentData.references.length > 0) {
        await content.$relatedQuery("references", trx).insert(
          contentData.references.map((ref) => ({
            title: ref.title,
            url: ref.url,
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
    throw new Error(
      "Published content cannot be deleted. Please contact administrator."
    );
  }

  // Soft delete by setting status to archived
  const result = await KnowledgeContent.query().findById(contentId).patch({
    status: "archived",
    updated_at: new Date(),
  });

  return result;
};

/**
 * Build query for user's bookmarked contents with filters
 */
export const buildUserBookmarkQuery = (customId, filters = {}) => {
  const { search = "", category_id = "", tags = [], type = "" } = filters;

  // Base query: get bookmarked content through user_interactions
  // Note: Exclude content field for better performance on bookmarks
  let query = KnowledgeContent.query()
    .select(
      "knowledge.contents.id",
      "knowledge.contents.title",
      "knowledge.contents.summary",
      "knowledge.contents.author_id",
      "knowledge.contents.category_id",
      "knowledge.contents.type",
      "knowledge.contents.source_url",
      "knowledge.contents.status",
      "knowledge.contents.views_count",
      "knowledge.contents.likes_count",
      "knowledge.contents.comments_count",
      "knowledge.contents.bookmarks_count",
      "knowledge.contents.estimated_reading_time",
      "knowledge.contents.tags",
      "knowledge.contents.created_at",
      "knowledge.contents.updated_at"
    )
    .innerJoin(
      "knowledge.user_interactions",
      "knowledge.contents.id",
      "knowledge.user_interactions.content_id"
    )
    .where("knowledge.user_interactions.user_id", customId)
    .where("knowledge.user_interactions.interaction_type", "bookmark")
    .where("knowledge.contents.status", "published"); // Only show published content

  // Search filter - only search in title and summary for bookmarks
  if (search) {
    query = query.andWhere((builder) => {
      builder
        .where("knowledge.contents.title", "ilike", `%${search}%`)
        .orWhere("knowledge.contents.summary", "ilike", `%${search}%`);
    });
  }

  // Category filter
  if (category_id) {
    query = query.andWhere("knowledge.contents.category_id", category_id);
  }

  // Tags filter
  if (tags && tags.length > 0) {
    query = query.andWhere((builder) => {
      tags.forEach((tag) => {
        builder.orWhereRaw("knowledge.contents.tags @> ?", [
          JSON.stringify([tag]),
        ]);
      });
    });
  }

  // Type filter
  if (type && type !== "all") {
    if (type === "teks") {
      // For teks, include both 'teks' and null values
      query = query.andWhere((builder) => {
        builder
          .where("knowledge.contents.type", "teks")
          .orWhereNull("knowledge.contents.type");
      });
    } else {
      query = query.andWhere("knowledge.contents.type", type);
    }
  }

  return query;
};

/**
 * Get user's bookmarked knowledge contents with pagination and filters (internal function)
 */
const getUserBookmarkedContents = async (customId, filters = {}) => {
  const { page = 1, limit = 10, sort = "created_at:desc", tags = "" } = filters;

  // Process tags
  const tagFilters = Array.isArray(filters.tag)
    ? filters.tag
    : filters.tag
    ? [filters.tag]
    : [];
  const allTags = tags ? tags.split(",").filter(Boolean) : [];
  const finalTags = [...new Set([...tagFilters, ...allTags])].filter(Boolean);

  // Build query
  const baseQuery = buildUserBookmarkQuery(customId, {
    ...filters,
    tags: finalTags,
  });

  // Sorting
  const sortField = getSortField(sort);
  const sortDirection = getSortDirection(sort);

  // Handle null values in sorting for count fields
  let orderByClause;
  if (
    [
      "likes_count",
      "comments_count",
      "views_count",
      "bookmarks_count",
    ].includes(sortField)
  ) {
    orderByClause = KnowledgeContent.raw(
      `COALESCE(knowledge.contents.${sortField}, 0) ${sortDirection.toUpperCase()}`
    );
  } else {
    orderByClause = [`knowledge.contents.${sortField}`, sortDirection];
  }

  // Execute paginated query with interactions - exclude content field for performance
  const result = await baseQuery
    .select(
      "knowledge.contents.id",
      "knowledge.contents.title",
      "knowledge.contents.summary",
      "knowledge.contents.author_id",
      "knowledge.contents.category_id",
      KnowledgeContent.raw("COALESCE(knowledge.contents.type, 'teks') as type"),
      "knowledge.contents.source_url",
      "knowledge.contents.status",
      "knowledge.contents.tags",
      KnowledgeContent.raw(
        "COALESCE(knowledge.contents.likes_count, 0) as likes_count"
      ),
      KnowledgeContent.raw(
        "COALESCE(knowledge.contents.comments_count, 0) as comments_count"
      ),
      KnowledgeContent.raw(
        "COALESCE(knowledge.contents.views_count, 0) as views_count"
      ),
      KnowledgeContent.raw(
        "COALESCE(knowledge.contents.bookmarks_count, 0) as bookmarks_count"
      ),
      "knowledge.contents.created_at",
      "knowledge.contents.updated_at",
      "knowledge.user_interactions.created_at as bookmarked_at",
      ...buildUserInteractionSubqueries(customId)
      // Note: Excluded 'content' field for better performance on bookmarks
    )
    .withGraphFetched(
      "[author(simpleWithImage), category, user_verified(simpleWithImage)]"
    )
    .orderByRaw(
      Array.isArray(orderByClause)
        ? `${orderByClause[0]} ${orderByClause[1]}`
        : orderByClause
    )
    .page(page - 1, limit);

  return {
    results: result.results,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
};

/**
 * Get user's bookmarked contents with statistics (similar to getUserContentsWithStats)
 */
export const getUserKnowledgeContentsBookmarks = async (
  customId,
  filters = {}
) => {
  const [contents, statusCounts, typeCounts, engagementStats, categoryCounts] =
    await Promise.all([
      getUserBookmarkedContents(customId, filters),
      getUserBookmarkStatusCounts(customId),
      getUserBookmarkTypeCounts(customId),
      getUserEngagementStats(customId), // Keep engagement stats from user's own content
      getUserBookmarkCategoryCounts(customId),
    ]);

  return {
    data: contents?.results,
    total: contents?.total,
    page: contents?.page + 1 || 1,
    limit: contents?.limit || 10,
    statusCounts,
    typeCounts,
    categoryCounts,
    stats: {
      ...engagementStats,
      ...statusCounts,
    },
  };
};

export const deleteUserContentAttachment = async (
  contentId,
  attachmentId,
  customId
) => {
  console.log(attachmentId);
  // cek konten dulu apa dia yang buat
  const content = await KnowledgeContent.query()
    .findById(contentId)
    .where("author_id", customId);

  if (!content) {
    throw new Error("Content not found or access denied");
  }

  // cek attachment dulu apa dia yang buat
  const attachment = await KnowledgeContentAttachments.query()
    .findById(attachmentId)
    .where("content_id", contentId);

  if (!attachment) {
    throw new Error("Attachment not found or access denied");
  }

  await KnowledgeContentAttachments.query().findById(attachmentId).delete();

  // should be implement delete from minio

  return {
    success: true,
    message: "Attachment deleted successfully",
  };
};
