import { handleError } from "@/utils/helper/controller-helper";

const KnowledgeContent = require("@/models/knowledge/contents.model");

export const getUserKnowledgeContents = async (req, res) => {
  try {
    const { customId } = req?.user;
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "created_at",
      category_id = "",
      tags = "",
      status = "draft",
      is_bookmarked = "",
      is_liked = "",
    } = req?.query;

    // Build main query for user's content
    let contents = await KnowledgeContent.query()
      .where("knowledge.contents.author_id", customId)
      .andWhere((builder) => {
        if (search) {
          builder.where("title", "ilike", `%${search}%`)
            .orWhere("content", "ilike", `%${search}%`);
        }
      })
      .andWhere((builder) => {
        if (category_id) {
          builder.where("category_id", category_id);
        }
      })
      .andWhere((builder) => {
        if (tags) {
          builder.whereRaw("tags @> ?", [JSON.stringify([tags])]);
        }
      })
      .andWhere((builder) => {
        if (status) {
          builder.where("status", status);
        }
      })
      .select(
        "knowledge.contents.*",
        // Subquery for is_liked - only if filter is applied
        ...(is_liked ? [
          KnowledgeContent.relatedQuery('user_interactions')
            .where('user_id', customId)
            .where('interaction_type', 'like')
            .select(KnowledgeContent.raw('CASE WHEN COUNT(*) > 0 THEN true ELSE false END'))
            .as('is_liked')
        ] : [
          KnowledgeContent.relatedQuery('user_interactions')
            .where('user_id', customId)
            .where('interaction_type', 'like')
            .select(KnowledgeContent.raw('CASE WHEN COUNT(*) > 0 THEN true ELSE false END'))
            .as('is_liked')
        ]),
        // Subquery for is_bookmarked - only if filter is applied
        ...(is_bookmarked ? [
          KnowledgeContent.relatedQuery('user_interactions')
            .where('user_id', customId)
            .where('interaction_type', 'bookmark')
            .select(KnowledgeContent.raw('CASE WHEN COUNT(*) > 0 THEN true ELSE false END'))
            .as('is_bookmarked')
        ] : [
          KnowledgeContent.relatedQuery('user_interactions')
            .where('user_id', customId)
            .where('interaction_type', 'bookmark')
            .select(KnowledgeContent.raw('CASE WHEN COUNT(*) > 0 THEN true ELSE false END'))
            .as('is_bookmarked')
        ])
      )
      .withGraphFetched(
        "[author(simpleWithImage), category, user_verified(simpleWithImage), versions.[user_updated(simpleWithImage)], attachments, references]"
      )
      .orderBy(getSortField(sort), getSortDirection(sort))
      .page(page - 1, limit);

    // Apply post-query filters for interaction-based filtering
    if (is_liked === "true" || is_bookmarked === "true") {
      contents.results = contents.results.filter(content => {
        let match = true;
        if (is_liked === "true" && !content.is_liked) match = false;
        if (is_bookmarked === "true" && !content.is_bookmarked) match = false;
        return match;
      });
    }

    const data = {
      data: contents?.results,
      total: contents?.total,
      page: contents?.page + 1 || 1,
      limit: contents?.limit || 10,
    };

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

// Helper functions for sorting
function getSortField(sort) {
  switch (sort) {
    case "created_at_asc":
      return "created_at";
    case "likes_count":
      return "likes_count";
    case "comments_count":
      return "comments_count";
    case "title_asc":
    case "title_desc":
      return "title";
    case "updated_at":
      return "updated_at";
    default:
      return "created_at";
  }
}

function getSortDirection(sort) {
  switch (sort) {
    case "created_at_asc":
    case "title_asc":
      return "asc";
    case "title_desc":
      return "desc";
    default:
      return "desc";
  }
}
