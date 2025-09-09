const KnowledgeContent = require("@/models/knowledge/contents.model");

// ===== ADMIN QUERY BUILDERS =====

/**
 * Get sort field for admin content ordering
 * Maps frontend sort options to database fields
 */
export const getAdminSortField = (sort) => {
  const [field] = sort.split(":");
  switch (field) {
    case "created_at":
      return "created_at";
    case "updated_at": 
      return "updated_at";
    case "likes_count":
      return "likes_count";
    case "comments_count":
      return "comments_count";
    case "views_count":
      return "views_count";
    case "title":
      return "title";
    case "status":
      return "status";
    default:
      return "created_at";
  }
};

/**
 * Get sort direction for admin content ordering
 */
export const getAdminSortDirection = (sort) => {
  const [, direction = "desc"] = sort.split(":");
  return direction === "asc" ? "asc" : "desc";
};

/**
 * Build query for admin knowledge contents with comprehensive filters
 * Similar to user content query but for admin with all content visibility
 */
export const buildAdminContentQuery = (filters = {}) => {
  const {
    search = "",
    category_id = "",
    tags = [],
    status = "",
    type = "",
  } = filters;

  // Base query: admin can see all content regardless of author
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
      "knowledge.contents.updated_at",
      "knowledge.contents.verified_by",
      "knowledge.contents.verified_at",
      "knowledge.contents.reason" // For rejection/revision reasons
    );

  // Search filter - search in title, summary, and content for admin
  if (search) {
    query = query.andWhere((builder) => {
      builder
        .where("knowledge.contents.title", "ilike", `%${search}%`)
        .orWhere("knowledge.contents.summary", "ilike", `%${search}%`)
        .orWhere("knowledge.contents.content", "ilike", `%${search}%`);
    });
  }

  // Category filter
  if (category_id) {
    query = query.andWhere("knowledge.contents.category_id", category_id);
  }

  // Status filter - admin can filter by any status
  if (status) {
    query = query.andWhere("knowledge.contents.status", status);
  }

  // Type filter (teks, gambar, video, audio)
  if (type) {
    if (type === "teks") {
      // Text content: null type or explicitly 'teks'
      query = query.andWhere((builder) => {
        builder.whereNull("knowledge.contents.type").orWhere("knowledge.contents.type", "teks");
      });
    } else {
      // Specific media types
      query = query.andWhere("knowledge.contents.type", type);
    }
  }

  // Tags filter - admin can filter by tags
  if (tags && tags.length > 0) {
    query = query.andWhere((builder) => {
      tags.forEach((tag) => {
        builder.orWhereRaw(
          "JSON_CONTAINS(LOWER(CAST(knowledge.contents.tags AS CHAR)), LOWER(?))",
          [`"${tag}"`]
        );
      });
    });
  }

  return query;
};

// ===== ADMIN CONTENT SERVICES =====

/**
 * Get admin knowledge contents with comprehensive pagination and filters
 * Main service function for admin content listing
 */
export const getAdminKnowledgeContents = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = "created_at:desc",
    tags = "",
  } = filters;

  // Process tags from string to array
  const tagFilters = Array.isArray(filters.tag) 
    ? filters.tag 
    : filters.tag 
    ? [filters.tag] 
    : [];
  const allTags = tags ? tags.split(",").filter(Boolean) : [];
  const finalTags = [...new Set([...tagFilters, ...allTags])].filter(Boolean);

  // Build base query with all filters
  const baseQuery = buildAdminContentQuery({
    ...filters,
    tags: finalTags,
  });

  // Apply sorting
  const sortField = getAdminSortField(sort);
  const sortDirection = getAdminSortDirection(sort);

  // Handle null values in sorting for count fields
  let orderByClause;
  if (["likes_count", "comments_count", "views_count", "bookmarks_count"].includes(sortField)) {
    orderByClause = KnowledgeContent.raw(
      `COALESCE(knowledge.contents.${sortField}, 0) ${sortDirection.toUpperCase()}`
    );
  } else {
    orderByClause = [`knowledge.contents.${sortField}`, sortDirection];
  }

  // Execute paginated query with relations
  const result = await baseQuery
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
    page: page - 1, // Objection.js uses 0-based pagination
    limit: limit,
  };
};

// ===== ADMIN STATISTICS SERVICES =====

/**
 * Get comprehensive admin content status counts
 * Includes all possible content statuses for admin
 */
export const getAdminContentStatusCounts = async () => {
  const results = await KnowledgeContent.query()
    .groupBy("status")
    .select("status")
    .count("* as count");

  // Initialize all possible admin status counts
  const counts = {
    all: 0,
    draft: 0,
    pending: 0,
    published: 0,
    rejected: 0,
    archived: 0,
    pending_revision: 0,
    revision_rejected: 0,
  };

  // Fill in actual counts from database
  results.forEach((result) => {
    const status = result.status;
    const count = parseInt(result.count);
    if (counts.hasOwnProperty(status)) {
      counts[status] = count;
      counts.all += count;
    }
  });

  return counts;
};

/**
 * Get admin content type counts  
 * Count content by type (teks, gambar, video, audio)
 */
export const getAdminContentTypeCounts = async () => {
  const results = await KnowledgeContent.query()
    .select(
      KnowledgeContent.raw("COALESCE(type, 'teks') as type_normalized"),
      KnowledgeContent.raw("COUNT(*) as count")
    )
    .groupBy(KnowledgeContent.raw("COALESCE(type, 'teks')"));

  // Initialize type counts
  const counts = {
    all: 0,
    teks: 0,
    gambar: 0,
    video: 0,
    audio: 0,
  };

  // Fill in actual counts
  results.forEach((result) => {
    const type = result.type_normalized;
    const count = parseInt(result.count);
    if (counts.hasOwnProperty(type)) {
      counts[type] = count;
      counts.all += count;
    }
  });

  return counts;
};

/**
 * Get admin content category counts
 * Count content by category for admin filtering
 */
export const getAdminContentCategoryCounts = async () => {
  const results = await KnowledgeContent.query()
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

  // Build category counts object
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
 * Get overall admin content engagement statistics
 * Aggregate statistics for all content visible to admin
 */
export const getAdminEngagementStats = async () => {
  const stats = await KnowledgeContent.query()
    .select(
      KnowledgeContent.raw("COALESCE(SUM(likes_count), 0) as total_likes"),
      KnowledgeContent.raw("COALESCE(SUM(comments_count), 0) as total_comments"),
      KnowledgeContent.raw("COALESCE(SUM(views_count), 0) as total_views"),
      KnowledgeContent.raw("COALESCE(SUM(bookmarks_count), 0) as total_bookmarks"),
      KnowledgeContent.raw("COUNT(*) as total_contents")
    )
    .first();

  return {
    total_likes: parseInt(stats?.total_likes || 0),
    total_comments: parseInt(stats?.total_comments || 0), 
    total_views: parseInt(stats?.total_views || 0),
    total_bookmarks: parseInt(stats?.total_bookmarks || 0),
    total_contents: parseInt(stats?.total_contents || 0),
  };
};

/**
 * Get comprehensive admin knowledge contents with all statistics
 * Main function that combines content listing with all counts
 * Similar to user bookmark system but for admin with full visibility
 */
export const getAdminKnowledgeContentsWithStats = async (filters = {}) => {
  // Get content data and all statistics in parallel for better performance
  const [contents, statusCounts, typeCounts, engagementStats, categoryCounts] =
    await Promise.all([
      getAdminKnowledgeContents(filters),
      getAdminContentStatusCounts(),
      getAdminContentTypeCounts(), 
      getAdminEngagementStats(),
      getAdminContentCategoryCounts(),
    ]);

  // Return complete response with data and statistics
  // Format matches user bookmark system for consistency
  return {
    data: contents?.results,
    total: contents?.total,
    page: (contents?.page || 0) + 1, // Convert back to 1-based for frontend
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