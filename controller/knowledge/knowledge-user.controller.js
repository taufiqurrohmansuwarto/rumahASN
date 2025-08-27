import { handleError } from "@/utils/helper/controller-helper";

const KnowledgeContent = require("@/models/knowledge/contents.model");

// Get user knowledge content
export const getUserKnowledgeContent = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const content = await KnowledgeContent.query()
      .where("knowledge.contents.id", id)
      .withGraphFetched(
        "[author(simpleWithImage), category, user_verified(simpleWithImage), versions.[user_updated(simpleWithImage)], attachments, references]"
      )
      .select(
        "knowledge.contents.*",
        // Subquery untuk is_liked
        KnowledgeContent.relatedQuery("user_interactions")
          .where("user_id", customId)
          .where("interaction_type", "like")
          .select(
            KnowledgeContent.raw(
              "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
            )
          )
          .as("is_liked"),
        // Subquery untuk is_bookmarked
        KnowledgeContent.relatedQuery("user_interactions")
          .where("user_id", customId)
          .where("interaction_type", "bookmark")
          .select(
            KnowledgeContent.raw(
              "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
            )
          )
          .as("is_bookmarked")
      )
      .first();

    if (!content) {
      return res.status(404).json({
        message: "Konten tidak ditemukan",
      });
    }

    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

export const getUserKnowledgeContents = async (req, res) => {
  try {
    const { customId } = req?.user;
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "created_at", // Default: created_at DESC (terbaru)
      category_id = "",
      tags = "",
      status = "",
      is_bookmarked = "",
      is_liked = "",
    } = req?.query;

    // Handle multiple tags from URL params (tag=tutorial&tag=javascript)
    const tagFilters = Array.isArray(req.query.tag)
      ? req.query.tag
      : req.query.tag
      ? [req.query.tag]
      : [];
    const allTags = tags ? tags.split(",").filter(Boolean) : [];
    const finalTags = [...new Set([...tagFilters, ...allTags])].filter(Boolean);

    // Build main query for user's content
    let contents = await KnowledgeContent.query()
      .where("knowledge.contents.author_id", customId)
      .andWhere((builder) => {
        if (search) {
          builder
            .where("title", "ilike", `%${search}%`)
            .orWhere("content", "ilike", `%${search}%`);
        }
      })
      .andWhere((builder) => {
        if (category_id) {
          builder.where("category_id", category_id);
        }
      })
      .andWhere((builder) => {
        if (finalTags.length > 0) {
          // Check if any of the selected tags exist in the content tags
          builder.where((subBuilder) => {
            finalTags.forEach((tag) => {
              subBuilder.orWhereRaw("tags @> ?", [JSON.stringify([tag])]);
            });
          });
        }
      })
      .andWhere((builder) => {
        if (status) {
          builder.where("status", status);
        }
      })
      .select(
        "knowledge.contents.id",
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
        // Subquery for is_liked - only if filter is applied
        ...(is_liked
          ? [
              KnowledgeContent.relatedQuery("user_interactions")
                .where("user_id", customId)
                .where("interaction_type", "like")
                .select(
                  KnowledgeContent.raw(
                    "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
                  )
                )
                .as("is_liked"),
            ]
          : [
              KnowledgeContent.relatedQuery("user_interactions")
                .where("user_id", customId)
                .where("interaction_type", "like")
                .select(
                  KnowledgeContent.raw(
                    "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
                  )
                )
                .as("is_liked"),
            ]),
        // Subquery for is_bookmarked - only if filter is applied
        ...(is_bookmarked
          ? [
              KnowledgeContent.relatedQuery("user_interactions")
                .where("user_id", customId)
                .where("interaction_type", "bookmark")
                .select(
                  KnowledgeContent.raw(
                    "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
                  )
                )
                .as("is_bookmarked"),
            ]
          : [
              KnowledgeContent.relatedQuery("user_interactions")
                .where("user_id", customId)
                .where("interaction_type", "bookmark")
                .select(
                  KnowledgeContent.raw(
                    "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
                  )
                )
                .as("is_bookmarked"),
            ])
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

    // Get status counts for all user content (for filter UI)
    const statusCounts = await KnowledgeContent.query()
      .where("knowledge.contents.author_id", customId)
      .groupBy("status")
      .select("status")
      .count("* as count")
      .then((results) => {
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
      });

    // Get engagement statistics for user content
    const engagementStats = await KnowledgeContent.query()
      .where("knowledge.contents.author_id", customId)
      .select(
        KnowledgeContent.raw("COALESCE(SUM(likes_count), 0) as total_likes"),
        KnowledgeContent.raw(
          "COALESCE(SUM(comments_count), 0) as total_comments"
        ),
        KnowledgeContent.raw("COALESCE(SUM(views_count), 0) as total_views")
      )
      .first();

    const data = {
      data: contents?.results,
      total: contents?.total,
      page: contents?.page + 1 || 1,
      limit: contents?.limit || 10,
      // Additional stats for dashboard/filtering
      statusCounts,
      stats: {
        total_likes: parseInt(engagementStats?.total_likes || 0),
        total_comments: parseInt(engagementStats?.total_comments || 0),
        total_views: parseInt(engagementStats?.total_views || 0),
        ...statusCounts,
      },
    };

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

// Get user content statistics (status counts and engagement stats)
export const getUserKnowledgeStats = async (req, res) => {
  try {
    const { customId } = req?.user;

    // Get status counts for all user content
    const statusCounts = await KnowledgeContent.query()
      .where("knowledge.contents.author_id", customId)
      .groupBy("status")
      .select("status")
      .count("* as count")
      .then((results) => {
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
      });

    // Get engagement statistics for user content
    const engagementStats = await KnowledgeContent.query()
      .where("knowledge.contents.author_id", customId)
      .select(
        KnowledgeContent.raw("COALESCE(SUM(likes_count), 0) as total_likes"),
        KnowledgeContent.raw(
          "COALESCE(SUM(comments_count), 0) as total_comments"
        ),
        KnowledgeContent.raw("COALESCE(SUM(views_count), 0) as total_views")
      )
      .first();

    const data = {
      statusCounts,
      stats: {
        total_likes: parseInt(engagementStats?.total_likes || 0),
        total_comments: parseInt(engagementStats?.total_comments || 0),
        total_views: parseInt(engagementStats?.total_views || 0),
        ...statusCounts,
      },
    };

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

// Helper functions for sorting
function getSortField(sort) {
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
}

function getSortDirection(sort) {
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
}
