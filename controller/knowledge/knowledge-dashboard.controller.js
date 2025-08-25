import { handleError } from "@/utils/helper/controller-helper";

const KnowledgeContent = require("@/models/knowledge/contents.model");
const KnowledgeCategory = require("@/models/knowledge/categories.model");
const KnowledgeUserInteraction = require("@/models/knowledge/user-interactions.model");
const KnowledgeUserPoints = require("@/models/knowledge/user-points.model");
const KnowledgeUserBadges = require("@/models/knowledge/user-badges.model");
const KnowledgeMissions = require("@/models/knowledge/missions.model");

// Admin Dashboard Overview - System-wide statistics for administrators
export const getDashboardOverview = async (req, res) => {
  try {
    // Global Content Statistics (All content across the system)
    const contentStats = await KnowledgeContent.query()
      .select(
        KnowledgeContent.raw("COUNT(*) as total_contents"),
        KnowledgeContent.raw(
          "COUNT(CASE WHEN status = 'published' THEN 1 END) as published_contents"
        ),
        KnowledgeContent.raw(
          "COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_contents"
        ),
        KnowledgeContent.raw(
          "COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_contents"
        ),
        KnowledgeContent.raw(
          "COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_contents"
        ),
        KnowledgeContent.raw(
          "COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_contents"
        ),
        KnowledgeContent.raw("SUM(likes_count) as total_likes"),
        KnowledgeContent.raw("SUM(comments_count) as total_comments"),
        KnowledgeContent.raw("AVG(likes_count) as avg_likes_per_content"),
        KnowledgeContent.raw("AVG(comments_count) as avg_comments_per_content")
      )
      .first();

    // System-wide User Interaction Statistics
    const systemInteractionStats = await KnowledgeUserInteraction.query()
      .select(
        KnowledgeUserInteraction.raw(
          "COUNT(CASE WHEN interaction_type = 'like' THEN 1 END) as total_system_likes"
        ),
        KnowledgeUserInteraction.raw(
          "COUNT(CASE WHEN interaction_type = 'bookmark' THEN 1 END) as total_system_bookmarks"
        ),
        KnowledgeUserInteraction.raw(
          "COUNT(DISTINCT user_id) as total_active_users"
        )
      )
      .first();

    // Top Content (System-wide)
    const topContent = await KnowledgeContent.query()
      .where("status", "published")
      .withGraphFetched("[author(simpleWithImage), category]")
      .orderBy("likes_count", "desc")
      .limit(10);

    // Most Active Authors
    const topAuthors = await KnowledgeContent.query()
      .select("author_id", KnowledgeContent.raw("COUNT(*) as content_count"))
      .withGraphFetched("[author(simpleWithImage)]")
      .where("status", "published")
      .groupBy("author_id")
      .havingRaw("COUNT(*) >= 1")
      .orderByRaw("COUNT(*) DESC")
      .limit(10);

    // User Points Leaderboard
    const topUsers = await KnowledgeUserPoints.query()
      .withGraphFetched("[user(simpleWithImage)]")
      .orderBy("points", "desc")
      .limit(10);

    // Monthly Content Creation Trend (last 6 months)
    const monthlyTrend = await KnowledgeContent.query()
      .select(
        KnowledgeContent.raw("DATE_TRUNC('month', created_at) as month"),
        KnowledgeContent.raw("COUNT(*) as content_count"),
        KnowledgeContent.raw("SUM(likes_count) as total_likes"),
        KnowledgeContent.raw("SUM(comments_count) as total_comments")
      )
      .where("status", "published")
      .where(KnowledgeContent.raw("created_at >= NOW() - INTERVAL '6 months'"))
      .groupBy(KnowledgeContent.raw("DATE_TRUNC('month', created_at)"))
      .orderBy("month", "asc");

    // Recent Activity (last 7 days)
    const recentActivity = {
      new_contents: await KnowledgeContent.query()
        .where(KnowledgeContent.raw("created_at >= NOW() - INTERVAL '7 days'"))
        .count("* as count")
        .first(),
      new_likes: await KnowledgeUserInteraction.query()
        .where("interaction_type", "like")
        .where(
          KnowledgeUserInteraction.raw(
            "created_at >= NOW() - INTERVAL '7 days'"
          )
        )
        .count("* as count")
        .first(),
      new_bookmarks: await KnowledgeUserInteraction.query()
        .where("interaction_type", "bookmark")
        .where(
          KnowledgeUserInteraction.raw(
            "created_at >= NOW() - INTERVAL '7 days'"
          )
        )
        .count("* as count")
        .first(),
      pending_reviews: await KnowledgeContent.query()
        .where("status", "pending")
        .count("* as count")
        .first(),
    };

    const response = {
      // System-wide content statistics
      content_statistics: {
        total_contents: parseInt(contentStats.total_contents),
        published_contents: parseInt(contentStats.published_contents),
        draft_contents: parseInt(contentStats.draft_contents),
        pending_contents: parseInt(contentStats.pending_contents),
        rejected_contents: parseInt(contentStats.rejected_contents),
        archived_contents: parseInt(contentStats.archived_contents),
        total_likes: parseInt(contentStats.total_likes) || 0,
        total_comments: parseInt(contentStats.total_comments) || 0,
        avg_likes_per_content:
          parseFloat(contentStats.avg_likes_per_content) || 0,
        avg_comments_per_content:
          parseFloat(contentStats.avg_comments_per_content) || 0,
      },
      // System interaction statistics
      interaction_statistics: {
        total_system_likes:
          parseInt(systemInteractionStats.total_system_likes) || 0,
        total_system_bookmarks:
          parseInt(systemInteractionStats.total_system_bookmarks) || 0,
        total_active_users:
          parseInt(systemInteractionStats.total_active_users) || 0,
      },
      // Performance data
      performance_data: {
        top_content: topContent || [],
        top_authors: topAuthors || [],
        top_users: topUsers || [],
        monthly_trend: monthlyTrend || [],
      },
      // Admin alerts and metrics
      admin_metrics: {
        recent_activity: {
          new_contents_7d: parseInt(recentActivity.new_contents.count),
          new_likes_7d: parseInt(recentActivity.new_likes.count),
          new_bookmarks_7d: parseInt(recentActivity.new_bookmarks.count),
          pending_reviews: parseInt(recentActivity.pending_reviews.count),
        },
      },
    };

    res.json(response);
  } catch (error) {
    handleError(res, error);
  }
};

// Admin Category Analytics - Comprehensive category performance analysis
export const getCategoryAnalytics = async (req, res) => {
  try {
    const categories = await KnowledgeCategory.query();

    const categoryAnalytics = await Promise.all(
      categories.map(async (category) => {
        // Get all content for this category (including non-published for admin view)
        const allContents = await KnowledgeContent.query()
          .where("category_id", category.id)
          .select(
            "id",
            "title",
            "status",
            "likes_count",
            "comments_count",
            "created_at"
          );

        const publishedContents = allContents.filter(
          (content) => content.status === "published"
        );
        const draftContents = allContents.filter(
          (content) => content.status === "draft"
        );
        const pendingContents = allContents.filter(
          (content) => content.status === "pending"
        );

        const totalLikes = publishedContents.reduce(
          (sum, content) => sum + (content.likes_count || 0),
          0
        );
        const totalComments = publishedContents.reduce(
          (sum, content) => sum + (content.comments_count || 0),
          0
        );
        const avgLikes =
          publishedContents.length > 0
            ? (totalLikes / publishedContents.length).toFixed(2)
            : 0;
        const avgComments =
          publishedContents.length > 0
            ? (totalComments / publishedContents.length).toFixed(2)
            : 0;

        // Calculate engagement score (likes + comments * 2)
        const engagementScore = totalLikes + totalComments * 2;

        // Get top performing content in this category
        const topContent = publishedContents
          .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
          .slice(0, 5);

        // Monthly growth for this category (last 6 months)
        const monthlyGrowth = await KnowledgeContent.query()
          .where("category_id", category.id)
          .where("status", "published")
          .where(
            KnowledgeContent.raw("created_at >= NOW() - INTERVAL '6 months'")
          )
          .select(
            KnowledgeContent.raw("DATE_TRUNC('month', created_at) as month"),
            KnowledgeContent.raw("COUNT(*) as content_count")
          )
          .groupBy(KnowledgeContent.raw("DATE_TRUNC('month', created_at)"))
          .orderBy("month", "asc");

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          statistics: {
            total_contents: allContents.length,
            published_contents: publishedContents.length,
            draft_contents: draftContents.length,
            pending_contents: pendingContents.length,
            total_likes: totalLikes,
            total_comments: totalComments,
            average_likes: parseFloat(avgLikes),
            average_comments: parseFloat(avgComments),
            engagement_score: engagementScore,
          },
          performance: {
            top_content: topContent,
            monthly_growth: monthlyGrowth,
          },
        };
      })
    );

    // Sort categories by engagement score
    categoryAnalytics.sort(
      (a, b) => b.statistics.engagement_score - a.statistics.engagement_score
    );

    // Calculate totals
    const totalPublishedContent = categoryAnalytics.reduce(
      (sum, cat) => sum + cat.statistics.published_contents,
      0
    );
    const totalDraftContent = categoryAnalytics.reduce(
      (sum, cat) => sum + cat.statistics.draft_contents,
      0
    );
    const totalPendingContent = categoryAnalytics.reduce(
      (sum, cat) => sum + cat.statistics.pending_contents,
      0
    );
    const totalLikes = categoryAnalytics.reduce(
      (sum, cat) => sum + cat.statistics.total_likes,
      0
    );
    const totalComments = categoryAnalytics.reduce(
      (sum, cat) => sum + cat.statistics.total_comments,
      0
    );

    res.json({
      summary: {
        total_categories: categories.length,
        total_published_content: totalPublishedContent,
        total_draft_content: totalDraftContent,
        total_pending_content: totalPendingContent,
        total_likes: totalLikes,
        total_comments: totalComments,
      },
      categories: categoryAnalytics,
    });
  } catch (error) {
    handleError(res, error);
  }
};
