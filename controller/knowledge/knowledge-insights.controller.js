import { handleError } from "@/utils/helper/controller-helper";
import dayjs from "dayjs";
const KnowledgeContent = require("@/models/knowledge/contents.model");

export const getTopContributors = async (req, res) => {
  try {
    const {
      period = "month", // month, quarter, year, all
      limit = 10,
    } = req.query;

    // Set date range based on period
    let startDate, endDate;
    const now = dayjs();

    switch (period) {
      case "week":
        startDate = now.startOf("week").toDate();
        endDate = now.endOf("week").toDate();
        break;
      case "month":
        startDate = now.startOf("month").toDate();
        endDate = now.endOf("month").toDate();
        break;
      case "quarter":
        startDate = now.startOf("quarter").toDate();
        endDate = now.endOf("quarter").toDate();
        break;
      case "year":
        startDate = now.startOf("year").toDate();
        endDate = now.endOf("year").toDate();
        break;
      case "all":
      default:
        startDate = null;
        endDate = null;
    }

    // Get top contributors with their stats
    let query = KnowledgeContent.query()
      .select(
        "author_id",
        KnowledgeContent.raw("COUNT(*) as total_contents"),
        KnowledgeContent.raw("SUM(likes_count) as total_likes"),
        KnowledgeContent.raw("SUM(views_count) as total_views"),
        KnowledgeContent.raw("SUM(comments_count) as total_comments"),
        KnowledgeContent.raw("AVG(likes_count) as avg_likes"),
        KnowledgeContent.raw("MAX(created_at) as last_content_date")
      )
      .where("status", "published")
      .withGraphFetched("author(simpleWithImage)")
      .groupBy("author_id")
      .orderBy("total_contents", "desc")
      .orderBy("total_likes", "desc")
      .limit(parseInt(limit));

    // Add date filter if specified
    if (startDate && endDate) {
      query = query
        .where("created_at", ">=", startDate)
        .where("created_at", "<=", endDate);
    }

    const contributors = await query;

    // Transform data for better frontend consumption
    const result = contributors.map((contributor) => ({
      user: contributor.author,
      stats: {
        total_contents: parseInt(contributor.total_contents),
        total_likes: parseInt(contributor.total_likes || 0),
        total_views: parseInt(contributor.total_views || 0),
        total_comments: parseInt(contributor.total_comments || 0),
        avg_likes: parseFloat(contributor.avg_likes || 0).toFixed(1),
        last_content_date: contributor.last_content_date,
      },
    }));

    const data = {
      period,
      contributors: result,
      total: result.length,
    };

    res.json(data);
  } catch (error) {
    console.error("Error in getTopContributors:", error);
    handleError(res, error);
  }
};

export const getTopContents = async (req, res) => {
  try {
    const {
      period = "month", // week, month, quarter, year, all
      limit = 10,
      sortBy = "likes", // likes, views, comments, engagement
    } = req.query;

    // Set date range based on period
    let startDate, endDate;
    const now = dayjs();

    switch (period) {
      case "week":
        startDate = now.startOf("week").toDate();
        endDate = now.endOf("week").toDate();
        break;
      case "month":
        startDate = now.startOf("month").toDate();
        endDate = now.endOf("month").toDate();
        break;
      case "quarter":
        startDate = now.startOf("quarter").toDate();
        endDate = now.endOf("quarter").toDate();
        break;
      case "year":
        startDate = now.startOf("year").toDate();
        endDate = now.endOf("year").toDate();
        break;
      case "all":
      default:
        startDate = null;
        endDate = null;
    }

    // Determine sort column based on sortBy parameter
    let orderByColumn;
    switch (sortBy) {
      case "views":
        orderByColumn = "views_count";
        break;
      case "comments":
        orderByColumn = "comments_count";
        break;
      case "engagement":
        orderByColumn = KnowledgeContent.raw(
          "(likes_count + comments_count + (views_count * 0.1))"
        );
        break;
      case "likes":
      default:
        orderByColumn = "likes_count";
    }

    // Build query for top content
    let query = KnowledgeContent.query()
      .select(
        "id",
        "title",
        "summary",
        "author_id",
        "category_id",
        "type",
        "tags",
        "likes_count",
        "views_count",
        "comments_count",
        "bookmarks_count",
        "created_at",
        "updated_at"
      )
      .where("status", "published")
      .withGraphFetched("[author(simpleWithImage), category]")
      .orderBy(orderByColumn, "desc")
      .limit(parseInt(limit));

    // Add date filter if specified
    if (startDate && endDate) {
      query = query
        .where("created_at", ">=", startDate)
        .where("created_at", "<=", endDate);
    }

    const contents = await query;

    // Transform data with engagement score
    const result = contents.map((content) => ({
      ...content,
      engagement_score: (
        (content.likes_count || 0) +
        (content.comments_count || 0) +
        (content.views_count || 0) * 0.1
      ).toFixed(1),
      tags:
        typeof content.tags === "string"
          ? JSON.parse(content.tags)
          : content.tags,
    }));

    res.json({
      period,
      sortBy,
      contents: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Error in getTopContents:", error);
    handleError(res, error);
  }
};

export const getTopCategories = async (req, res) => {
  try {
    const {
      period = "month", // week, month, quarter, year, all
      limit = 10,
      sortBy = "content_count", // content_count, engagement, activity
    } = req.query;

    // Set date range based on period
    let startDate, endDate;
    const now = dayjs();

    switch (period) {
      case "week":
        startDate = now.startOf("week").toDate();
        endDate = now.endOf("week").toDate();
        break;
      case "month":
        startDate = now.startOf("month").toDate();
        endDate = now.endOf("month").toDate();
        break;
      case "quarter":
        startDate = now.startOf("quarter").toDate();
        endDate = now.endOf("quarter").toDate();
        break;
      case "year":
        startDate = now.startOf("year").toDate();
        endDate = now.endOf("year").toDate();
        break;
      case "all":
      default:
        startDate = null;
        endDate = null;
    }

    // Get categories with their content statistics
    let query = KnowledgeContent.query()
      .select(
        "category_id",
        KnowledgeContent.raw("COUNT(*) as content_count"),
        KnowledgeContent.raw("SUM(likes_count) as total_likes"),
        KnowledgeContent.raw("SUM(views_count) as total_views"),
        KnowledgeContent.raw("SUM(comments_count) as total_comments"),
        KnowledgeContent.raw("SUM(bookmarks_count) as total_bookmarks"),
        KnowledgeContent.raw("AVG(likes_count) as avg_likes"),
        KnowledgeContent.raw("MAX(created_at) as latest_content")
      )
      .where("status", "published")
      .whereNotNull("category_id")
      .withGraphFetched("category")
      .groupBy("category_id");

    // Add date filter if specified
    if (startDate && endDate) {
      query = query
        .where("created_at", ">=", startDate)
        .where("created_at", "<=", endDate);
    }

    // Determine sort order
    switch (sortBy) {
      case "engagement":
        query = query.orderBy(
          KnowledgeContent.raw(
            "SUM(likes_count + comments_count + (views_count * 0.1))"
          ),
          "desc"
        );
        break;
      case "activity":
        query = query.orderBy("latest_content", "desc");
        break;
      case "content_count":
      default:
        query = query.orderBy("content_count", "desc");
    }

    query = query.limit(parseInt(limit));

    const categories = await query;

    // Transform data for better frontend consumption
    const result = categories.map((category) => ({
      category: category.category,
      stats: {
        content_count: parseInt(category.content_count),
        total_likes: parseInt(category.total_likes || 0),
        total_views: parseInt(category.total_views || 0),
        total_comments: parseInt(category.total_comments || 0),
        total_bookmarks: parseInt(category.total_bookmarks || 0),
        avg_likes: parseFloat(category.avg_likes || 0).toFixed(1),
        latest_content: category.latest_content,
        engagement_score: (
          (parseInt(category.total_likes) || 0) +
          (parseInt(category.total_comments) || 0) +
          (parseInt(category.total_views) || 0) * 0.1
        ).toFixed(1),
      },
    }));

    res.json({
      period,
      sortBy,
      categories: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Error in getTopCategories:", error);
    handleError(res, error);
  }
};

export const getTopTags = async (req, res) => {
  try {
    const {
      period = "month", // week, month, quarter, year, all
      limit = 20,
      sortBy = "usage_count", // usage_count, engagement, recent
    } = req.query;

    // Set date range based on period
    let startDate, endDate;
    const now = dayjs();

    switch (period) {
      case "week":
        startDate = now.startOf("week").toDate();
        endDate = now.endOf("week").toDate();
        break;
      case "month":
        startDate = now.startOf("month").toDate();
        endDate = now.endOf("month").toDate();
        break;
      case "quarter":
        startDate = now.startOf("quarter").toDate();
        endDate = now.endOf("quarter").toDate();
        break;
      case "year":
        startDate = now.startOf("year").toDate();
        endDate = now.endOf("year").toDate();
        break;
      case "all":
      default:
        startDate = null;
        endDate = null;
    }

    // Get content with tags in the specified period
    let query = KnowledgeContent.query()
      .select(
        "tags",
        "likes_count",
        "views_count",
        "comments_count",
        "created_at"
      )
      .where("status", "published")
      .whereNotNull("tags")
      .where("tags", "!=", "[]")
      .where("tags", "!=", "null");

    // Add date filter if specified
    if (startDate && endDate) {
      query = query
        .where("created_at", ">=", startDate)
        .where("created_at", "<=", endDate);
    }

    const contents = await query;

    // Process tags and calculate statistics
    const tagStats = {};

    contents.forEach((content) => {
      let tags = [];

      try {
        tags =
          typeof content.tags === "string"
            ? JSON.parse(content.tags)
            : content.tags || [];
      } catch (error) {
        // Skip invalid JSON
        return;
      }

      tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase().trim();

        if (!tagStats[normalizedTag]) {
          tagStats[normalizedTag] = {
            tag: tag, // Keep original case
            usage_count: 0,
            total_likes: 0,
            total_views: 0,
            total_comments: 0,
            latest_usage: null,
          };
        }

        tagStats[normalizedTag].usage_count++;
        tagStats[normalizedTag].total_likes += content.likes_count || 0;
        tagStats[normalizedTag].total_views += content.views_count || 0;
        tagStats[normalizedTag].total_comments += content.comments_count || 0;

        // Update latest usage date
        if (
          !tagStats[normalizedTag].latest_usage ||
          new Date(content.created_at) >
            new Date(tagStats[normalizedTag].latest_usage)
        ) {
          tagStats[normalizedTag].latest_usage = content.created_at;
        }
      });
    });

    // Convert to array and add calculated fields
    let tagsArray = Object.values(tagStats).map((tag) => ({
      ...tag,
      avg_likes:
        tag.usage_count > 0
          ? (tag.total_likes / tag.usage_count).toFixed(1)
          : "0.0",
      engagement_score: (
        tag.total_likes +
        tag.total_comments +
        tag.total_views * 0.1
      ).toFixed(1),
    }));

    // Sort based on sortBy parameter
    switch (sortBy) {
      case "engagement":
        tagsArray = tagsArray.sort(
          (a, b) =>
            parseFloat(b.engagement_score) - parseFloat(a.engagement_score)
        );
        break;
      case "recent":
        tagsArray = tagsArray.sort(
          (a, b) => new Date(b.latest_usage) - new Date(a.latest_usage)
        );
        break;
      case "usage_count":
      default:
        tagsArray = tagsArray.sort((a, b) => b.usage_count - a.usage_count);
    }

    // Limit results
    const result = tagsArray.slice(0, parseInt(limit));

    res.json({
      period,
      sortBy,
      tags: result,
      total: result.length,
      total_unique_tags: tagsArray.length,
    });
  } catch (error) {
    console.error("Error in getTopTags:", error);
    handleError(res, error);
  }
};
