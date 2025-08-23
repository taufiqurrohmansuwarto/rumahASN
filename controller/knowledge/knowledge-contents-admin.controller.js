const KnowledgeContent = require("@/models/knowledge/contents.model");
import { handleError } from "@/utils/helper/controller-helper";

export const getKnowledgeContentsAdmin = async (req, res) => {
  try {
    // default filter adalah draft
    const {
      search,
      page = 1,
      limit = 10,
      categoryId,
      status = "draft",
    } = req?.query;

    const contents = await KnowledgeContent.query()
      .where("status", status)
      .andWhere((builder) => {
        if (categoryId) {
          builder.where("category_id", categoryId);
        }
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
      })
      .withGraphFetched("[author(simpleSelect), category]")
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    const totalDraft = await KnowledgeContent.query()
      .where("status", "draft")
      .count("id as total");

    const totalPublished = await KnowledgeContent.query()
      .where("status", "published")
      .count("id as total");

    const totalRejected = await KnowledgeContent.query()
      .where("status", "rejected")
      .count("id as total");

    const totalArchived = await KnowledgeContent.query()
      .where("status", "archived")
      .count("id as total");

    const result = {
      data: contents.results,
      total: contents.total,
      page: parseInt(page),
      limit: parseInt(limit),
      statusCounts: {
        draft: parseInt(totalDraft[0].total),
        published: parseInt(totalPublished[0].total),
        rejected: parseInt(totalRejected[0].total),
        archived: parseInt(totalArchived[0].total),
      },
    };

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getKnowledgeContentAdmin = async (req, res) => {
  try {
    const { id } = req?.query;
    const content = await KnowledgeContent.query()
      .findById(id)
      .withGraphFetched("[author(simpleSelect), category]");

    if (!content) {
      res.status(404).json({
        message: "Content not found",
      });
    } else {
      res.json(content);
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const updateKnowledgeContentAdmin = async (req, res) => {
  try {
    const { id } = req?.query;
    const payload = req?.body;

    const data = {
      ...payload,
      tags: JSON.stringify(payload?.tags),
    };

    const content = await KnowledgeContent.query().where("id", id).update(data);

    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

export const changeStatusKnowledgeContentAdmin = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const payload = req?.body;

    const data = {
      ...payload,
      verified_by: customId,
      verified_at: new Date(),
    };

    const content = await KnowledgeContent.query().where("id", id).patch(data);
    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteKnowledgeContentAdmin = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    await KnowledgeContent.query()
      .findById(id)
      .update({ status: "archive", updated_by: customId });

    res.json({ message: "Content deleted successfully" });
  } catch (error) {
    handleError(res, error);
  }
};
