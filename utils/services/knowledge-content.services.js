import crypto from "crypto";
import { uploadFileMinio } from "@/utils/index";
import { generateTempMediaFilePath } from "@/utils/filename-helper";

const KnowledgeContent = require("@/models/knowledge/contents.model");
const KnowledgeCategory = require("@/models/knowledge/categories.model");
const KnowledgeContentAttachment = require("@/models/knowledge/content-attachments.model");
const UserInteraction = require("@/models/knowledge/user-interactions.model");
const KnowledgeAiMetadata = require("@/models/knowledge/knowledge-ai-metadata.model");

const BASE_URL = "https://siasn.bkd.jatimprov.go.id:9000/public";

// ===== UTILITY FUNCTIONS =====

/**
 * Helper function to encrypt customId for filename
 */
export const getEncryptedUserId = (customId) => {
  return crypto
    .createHash("sha256")
    .update(customId.toString())
    .digest("hex")
    .substring(0, 12);
};

/**
 * Calculate reading time for content
 */
export const calculateReadingTime = (content, summary = "") => {
  if (!content) return 1;

  // Remove markdown syntax
  const plainText = content
    .replace(/#{1,6}\s+/g, "") // Headers
    .replace(/\*{1,2}(.*?)\*{1,2}/g, "$1") // Bold/italic
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1") // Code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // Images
    .replace(/>\s+/g, "") // Blockquotes
    .replace(/[-*+]\s+/g, "") // Lists
    .replace(/\n+/g, " "); // Line breaks

  // Combine content + summary
  const fullText = `${summary || ""} ${plainText}`;
  const wordCount = fullText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Average reading speed for technical content
  const avgWordsPerMinute = 210;

  // Content complexity adjustments
  const hasCodeBlocks = /```[\s\S]*?```/.test(content);
  const hasImages = /!\[[^\]]*\]\([^)]*\)/.test(content);
  const hasTables = /\|.*\|/.test(content);

  let adjustmentFactor = 1;
  if (hasCodeBlocks) adjustmentFactor += 0.3;
  if (hasImages) adjustmentFactor += 0.2;
  if (hasTables) adjustmentFactor += 0.15;

  const baseMinutes = wordCount / avgWordsPerMinute;
  const adjustedMinutes = baseMinutes * adjustmentFactor;

  return Math.max(1, Math.round(adjustedMinutes));
};

// ===== CONTENT QUERY SERVICES =====

/**
 * Build content query with filters
 */
export const buildContentQuery = (filters = {}) => {
  const {
    search,
    category_id,
    tags = [],
    type,
    status = "published",
    author_id,
    page = 1,
    limit = 10,
    sort = "created_at",
  } = filters;

  let query = KnowledgeContent.query().where("status", status);

  // Search filter
  if (search) {
    query = query.andWhere((builder) => {
      builder.where("title", "ilike", `%${search}%`);
    });
  }

  // Category filter
  if (category_id) {
    query = query.andWhere("category_id", category_id);
  }

  // Tags filter
  if (tags.length > 0) {
    query = query.andWhere((builder) => {
      tags.forEach((tag) => {
        builder.orWhereRaw("tags @> ?", [JSON.stringify([tag])]);
      });
    });
  }

  // Type filter
  if (type && type !== "all") {
    query = query.andWhere("type", type);
  }

  // Author filter
  if (author_id) {
    query = query.andWhere("author_id", author_id);
  }

  // Sorting
  const [sortField, sortDirection = "desc"] = sort.split(":");
  query = query.orderBy(sortField, sortDirection);

  return query;
};

/**
 * Get contents with pagination, filters, and user interactions
 */
export const getContentsWithFilters = async (filters = {}, userId = null) => {
  const { page = 1, limit = 10 } = filters;

  let query = buildContentQuery(filters).select(
    "knowledge.contents.id",
    "knowledge.contents.title",
    "knowledge.contents.summary",
    "knowledge.contents.author_id",
    "knowledge.contents.category_id",
    "knowledge.contents.tags",
    "knowledge.contents.type",
    "knowledge.contents.source_url",
    "knowledge.contents.status",
    "knowledge.contents.views_count",
    "knowledge.contents.likes_count",
    "knowledge.contents.comments_count",
    "knowledge.contents.bookmarks_count",
    "knowledge.contents.estimated_reading_time",
    "knowledge.contents.created_at",
    "knowledge.contents.updated_at"
  );

  // Add user interaction subqueries if userId provided
  if (userId) {
    query = query.select(
      // Subquery for is_liked
      KnowledgeContent.relatedQuery("user_interactions")
        .where("user_id", userId)
        .where("interaction_type", "like")
        .select(
          KnowledgeContent.raw(
            "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
          )
        )
        .as("is_liked"),
      // Subquery for is_bookmarked
      KnowledgeContent.relatedQuery("user_interactions")
        .where("user_id", userId)
        .where("interaction_type", "bookmark")
        .select(
          KnowledgeContent.raw(
            "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
          )
        )
        .as("is_bookmarked")
    );
  }

  query = query
    .withGraphFetched(
      "[author(simpleWithImage), category, user_verified(simpleWithImage)]"
    )
    .page(page - 1, limit);

  const results = await query;

  return {
    data: results.results,
    total: results.total,
    page: parseInt(page),
    limit: parseInt(limit),
    hasMore: results.total > page * limit,
  };
};

/**
 * Get single content with full details and user interactions
 */
export const getContentById = async (
  contentId,
  options = {},
  userId = null
) => {
  const { includeRelations = true, status = "published" } = options;

  let query = KnowledgeContent.query()
    .where("knowledge.contents.id", contentId)
    .andWhere("knowledge.contents.status", status);

  // Add user interaction subqueries if userId provided
  if (userId) {
    query = query.select(
      "knowledge.contents.*",
      // Subquery for is_liked
      KnowledgeContent.relatedQuery("user_interactions")
        .where("user_id", userId)
        .where("interaction_type", "like")
        .select(
          KnowledgeContent.raw(
            "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
          )
        )
        .as("is_liked"),
      // Subquery for is_bookmarked
      KnowledgeContent.relatedQuery("user_interactions")
        .where("user_id", userId)
        .where("interaction_type", "bookmark")
        .select(
          KnowledgeContent.raw(
            "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
          )
        )
        .as("is_bookmarked")
    );
  } else {
    query = query.select("knowledge.contents.*");
  }

  if (includeRelations) {
    query = query.withGraphFetched(
      "[author(simpleWithImage), category, user_verified(simpleWithImage), versions.[user_updated(simpleWithImage)], attachments, references]"
    );
  }

  return await query.first();
};

/**
 * Get related contents using AI-powered semantic similarity
 * Falls back to tag/category-based matching if AI data is not available
 */
export const getRelatedContents = async (contentId, limit = 5) => {
  // Get main content with AI metadata
  const mainContent = await KnowledgeContent.query()
    .findById(contentId)
    .select("id", "tags", "category_id")
    .withGraphFetched("[ai_metadata]");

  if (!mainContent) return [];

  // Strategy 1: Use AI-generated related content recommendations
  if (mainContent.ai_metadata?.ai_related_content) {
    try {
      let aiRelatedIds = mainContent.ai_metadata.ai_related_content;

      // If it's a string, try to parse it. If it's already an array, use it directly
      if (typeof aiRelatedIds === "string") {
        aiRelatedIds = JSON.parse(aiRelatedIds);
      }

      if (Array.isArray(aiRelatedIds) && aiRelatedIds.length > 0) {
        const aiRelatedContents = await KnowledgeContent.query()
          .whereIn("id", aiRelatedIds.slice(0, limit))
          .where("status", "published")
          .select(
            "id",
            "title",
            "summary",
            "author_id",
            "category_id",
            "views_count",
            "likes_count",
            "estimated_reading_time",
            "created_at"
          )
          .withGraphFetched("[author(simpleWithImage), category]")
          .orderBy("views_count", "desc");

        if (aiRelatedContents.length > 0) {
          console.log(`Using AI-generated related content for ${contentId}`);
          return aiRelatedContents;
        }
      }
    } catch (error) {
      console.warn(
        `Error parsing AI related content for ${contentId}:`,
        error.message
      );
    }
  }

  // Strategy 2: Use AI keywords for semantic matching
  if (mainContent.ai_metadata?.ai_keywords) {
    try {
      let aiKeywords = mainContent.ai_metadata.ai_keywords;

      // If it's a string, try to parse it. If it's already an array, use it directly
      if (typeof aiKeywords === "string") {
        aiKeywords = JSON.parse(aiKeywords);
      }

      if (Array.isArray(aiKeywords) && aiKeywords.length > 0) {
        // Find contents with similar AI keywords
        const keywordRelatedContents = await KnowledgeContent.query()
          .where("knowledge.contents.id", "!=", contentId)
          .where("knowledge.contents.status", "published")
          .joinRelated("ai_metadata")
          .whereNotNull("ai_metadata.ai_keywords")
          .andWhere((builder) => {
            aiKeywords.forEach((keyword) => {
              builder.orWhereRaw("ai_metadata.ai_keywords @> ?", [
                JSON.stringify([keyword]),
              ]);
            });
          })
          .select(
            "knowledge.contents.id",
            "knowledge.contents.title",
            "knowledge.contents.summary",
            "knowledge.contents.author_id",
            "knowledge.contents.category_id",
            "knowledge.contents.views_count",
            "knowledge.contents.likes_count",
            "knowledge.contents.estimated_reading_time",
            "knowledge.contents.created_at"
          )
          .withGraphFetched("[author(simpleWithImage), category]")
          .limit(limit)
          .orderBy("knowledge.contents.views_count", "desc");

        if (keywordRelatedContents.length > 0) {
          console.log(`Using AI keyword matching for ${contentId}`);
          return keywordRelatedContents;
        }
      }
    } catch (error) {
      console.warn(`Error using AI keywords for ${contentId}:`, error.message);
    }
  }

  // Strategy 3: Fallback to traditional tag-based matching
  let tags = [];
  try {
    // Handle tags field - could be JSON string, array, or other format
    if (mainContent.tags) {
      if (typeof mainContent.tags === "string") {
        // Try to parse as JSON first
        try {
          tags = JSON.parse(mainContent.tags);
        } catch (parseError) {
          // If JSON parse fails, treat as single tag or comma-separated string
          tags = mainContent.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(mainContent.tags)) {
        // Already an array
        tags = mainContent.tags;
      }
    }
  } catch (error) {
    console.warn(
      `Error processing tags for content ${contentId}:`,
      mainContent.tags,
      error.message
    );
    tags = [];
  }

  if (tags.length > 0) {
    const tagRelatedContents = await KnowledgeContent.query()
      .where("id", "!=", contentId)
      .where("status", "published")
      .andWhere((builder) => {
        tags.forEach((tag) => {
          builder.orWhereRaw("tags @> ?", [JSON.stringify([tag])]);
        });
      })
      .select(
        "id",
        "title",
        "summary",
        "author_id",
        "category_id",
        "views_count",
        "likes_count",
        "estimated_reading_time",
        "created_at"
      )
      .withGraphFetched("[author(simpleWithImage), category]")
      .limit(limit)
      .orderBy("views_count", "desc");

    if (tagRelatedContents.length > 0) {
      console.log(`Using tag-based matching for ${contentId}`);
      return tagRelatedContents;
    }
  }

  // Strategy 4: Final fallback to same category
  console.log(`Using category fallback for ${contentId}`);
  return await KnowledgeContent.query()
    .where("category_id", mainContent.category_id)
    .where("id", "!=", contentId)
    .where("status", "published")
    .select(
      "id",
      "title",
      "summary",
      "author_id",
      "category_id",
      "views_count",
      "likes_count",
      "estimated_reading_time",
      "created_at"
    )
    .withGraphFetched("[author(simpleWithImage), category]")
    .limit(limit)
    .orderBy("views_count", "desc");
};

// ===== USER INTERACTION SERVICES =====

/**
 * Update views count for content
 */
export const updateViewsCount = async (customId, contentId) => {
  try {
    // Check if user already viewed this content
    const existingView = await UserInteraction.query()
      .where("user_id", customId)
      .where("content_id", contentId)
      .where("interaction_type", "view")
      .first();

    if (!existingView) {
      // Record user interaction
      await UserInteraction.query().insert({
        user_id: customId,
        content_id: contentId,
        interaction_type: "view",
      });

      // Increment views count
      await KnowledgeContent.query()
        .where("id", contentId)
        .increment("views_count", 1);
    }

    return !existingView; // true if new view, false if already viewed
  } catch (error) {
    console.error("Error updating views count:", error);
    throw new Error("Failed to update views count");
  }
};

// ===== CONTENT CRUD SERVICES =====

/**
 * Create new knowledge content with references
 */
export const createContent = async (contentData, authorId) => {
  const readingTime = calculateReadingTime(
    contentData.content,
    contentData.summary
  );

  const data = {
    ...contentData,
    author_id: authorId,
    tags: JSON.stringify(contentData.tags || []), // Use array directly for JSONB
    estimated_reading_time: readingTime,
    status: "draft",
  };

  return await KnowledgeContent.transaction(async (trx) => {
    // Insert content first
    const newContent = await KnowledgeContent.query(trx).insert(data);

    // Insert references if provided
    if (contentData.references && contentData.references.length > 0) {
      await newContent.$relatedQuery("references", trx).insert(
        contentData.references.map((reference) => ({
          title: reference.title,
          url: reference.url,
        }))
      );
    }

    return newContent;
  });
};

/**
 * Update existing content
 */
export const updateContent = async (contentId, contentData, userId) => {
  const readingTime = calculateReadingTime(
    contentData.content,
    contentData.summary
  );

  const updateData = {
    ...contentData,
    tags: contentData.tags || [], // Use array directly for JSONB
    estimated_reading_time: readingTime,
    updated_at: new Date(),
  };

  // Verify user owns the content
  const content = await KnowledgeContent.query()
    .findById(contentId)
    .where("author_id", userId);

  if (!content) {
    throw new Error("Content not found or access denied");
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
      .withGraphFetched("[references, category]");
  });
};

/**
 * Delete content (soft delete by changing status)
 */
export const deleteContent = async (contentId, userId) => {
  const content = await KnowledgeContent.query()
    .findById(contentId)
    .where("author_id", userId);

  if (!content) {
    throw new Error("Content not found or access denied");
  }

  return await KnowledgeContent.query()
    .findById(contentId)
    .patch({ status: "archived" });
};

// ===== FILE UPLOAD SERVICES =====

/**
 * Upload content attachment
 */
export const uploadContentAttachment = async (
  contentId,
  files,
  userId,
  isAdmin = false,
  mc
) => {
  const content = await KnowledgeContent.query().findById(contentId);

  if (!content) {
    throw new Error("Content not found");
  }

  // Verify permission (user owns content or is admin)
  if (!isAdmin && content.author_id !== userId) {
    throw new Error("Access denied");
  }

  const uploadPromises = files.map(async (file) => {
    const encryptedUserId = getEncryptedUserId(userId);
    const fileName = `knowledge-attachments/${encryptedUserId}/${Date.now()}-${
      file.originalname
    }`;

    const uploadResult = await uploadFileMinio(
      mc,
      file.buffer,
      fileName,
      file.size,
      file.mimetype
    );

    return {
      content_id: contentId,
      name: file.originalname,
      path: uploadResult.fileName,
      size: file.size,
      mime: file.mimetype,
      url: `${BASE_URL}/${uploadResult.fileName}`,
    };
  });

  const uploadResults = await Promise.all(uploadPromises);

  // Save to database
  const attachments = await KnowledgeContentAttachment.query()
    .insert(uploadResults)
    .returning("*");

  return {
    message: `${attachments.length} file(s) uploaded successfully`,
    attachments: attachments,
  };
};

/**
 * Upload media for content creation (temporary storage)
 */
export const uploadContentMedia = async (files, userId, mc) => {
  const uploadPromises = files.map(async (file) => {
    // Generate sanitized filename using helper
    const fileName = generateTempMediaFilePath(
      file.originalname,
      userId,
      getEncryptedUserId
    );

    await uploadFileMinio(mc, file.buffer, fileName, file.size, file.mimetype);

    return {
      uid: `temp-${Date.now()}-${Math.random()}`,
      name: fileName,
      status: "done",
      url: `${BASE_URL}/${fileName}`,
      size: file.size,
      type: file.mimetype,
    };
  });

  return await Promise.all(uploadPromises);
};

// ===== PUBLIC CONTENT STATISTICS SERVICES =====

/**
 * Get public content type counts (published status only)
 */
export const getPublicContentTypeCounts = async () => {
  const results = await KnowledgeContent.query()
    .where("knowledge.contents.status", "published")
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
 * Get public content category counts (published status only)
 */
export const getPublicContentCategoryCounts = async () => {
  const results = await KnowledgeContent.query()
    .where("knowledge.contents.status", "published")
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
 * Get public contents with full statistics
 */
export const getPublicContentsWithStats = async (
  filters = {},
  userId = null
) => {
  const [contents, typeCounts, categoryCounts] = await Promise.all([
    getContentsWithFilters({ ...filters, status: "published" }, userId),
    getPublicContentTypeCounts(),
    getPublicContentCategoryCounts(),
  ]);

  return {
    ...contents,
    typeCounts,
    categoryCounts,
    stats: {
      ...typeCounts,
    },
  };
};
