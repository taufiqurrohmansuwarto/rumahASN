import { handleError } from "@/utils/helper/controller-helper";

const KnowledgeContent = require("@/models/knowledge/contents.model");
const KnowledgeCategory = require("@/models/knowledge/categories.model");

export const getKnowledgeContents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req?.query;
    const contents = await KnowledgeContent.query()
      .andWhere((builder) => {
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
      })
      .andWhere("status", "published")
      .withGraphFetched("[author(simpleSelect), category]")
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    const data = {
      data: contents?.results,
      total: contents?.total,
      page: contents?.page || 1,
      limit: contents?.limit || 10,
    };

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getKnowledgeContent = async (req, res) => {
  try {
    const { id } = req?.query;
    const content = await KnowledgeContent.query()
      .where("id", id)
      .andWhere("status", "published")
      .first();

    if (!content) {
      return res.status(404).json({
        message: "Content not found",
      });
    }

    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

export const createKnowledgeContent = async (req, res) => {
  try {
    const body = req?.body;
    const { customId } = req?.user;

    const payload = {
      ...body,
      tags: JSON.stringify(body?.tags),
      author_id: customId,
    };

    const content = await KnowledgeContent.query().insert(payload);

    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateKnowledgeContentPersonal = async (req, res) => {
  try {
    const { id } = req?.query;
    const payload = req?.body;
    const { customId } = req?.user;

    const content = await KnowledgeContent.query()
      .where("id", id)
      .andWhere("user_id", customId)
      .andWhere("status", "draf")
      .update(payload);

    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteKnowledgeContent = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const content = await KnowledgeContent.query()
      .where("id", id)
      .andWhere("user_id", customId)
      .delete();

    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

// refs
export const getKnowledgeCategories = async (req, res) => {
  try {
    const categories = await KnowledgeCategory.query();
    res.json(categories);
  } catch (error) {
    handleError(res, error);
  }
};
