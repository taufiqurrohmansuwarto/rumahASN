const KnowledgeCategory = require("@/models/knowledge/categories.model");
import { handleError } from "@/utils/helper/controller-helper";

export const getKnowledgeCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req?.query;
    const categories = await KnowledgeCategory.query()
      .where((builder) => {
        if (search) {
          builder.where("name", "ilike", `%${search}%`);
        }
      })
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    const data = {
      data: categories?.data,
      total: categories?.total,
      page: categories?.page,
      limit: categories?.limit,
    };

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getKnowledgeCategory = async (req, res) => {
  try {
    const { id } = req?.query;
    const category = await KnowledgeCategory.query().where("id", id).first();

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json(category);
  } catch (error) {
    handleError(res, error);
  }
};

export const createKnowledgeCategory = async (req, res) => {
  try {
    const payload = req?.body;
    const category = await KnowledgeCategory.query().insert(payload);
    res.json(category);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateKnowledgeCategory = async (req, res) => {
  try {
    const { id } = req?.query;
    const payload = req?.body;
    const category = await KnowledgeCategory.query()
      .where("id", id)
      .update(payload);
    res.json(category);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteKnowledgeCategory = async (req, res) => {
  try {
    const { id } = req?.query;
    const category = await KnowledgeCategory.query().where("id", id).delete();
    res.json(category);
  } catch (error) {
    handleError(res, error);
  }
};
