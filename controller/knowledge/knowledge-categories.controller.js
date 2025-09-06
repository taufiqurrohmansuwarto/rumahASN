import { handleError } from "@/utils/helper/controller-helper";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from "@/utils/services/knowledge-category.services";

export const getKnowledgeCategories = async (req, res) => {
  try {
    // Use service to get all categories
    const categories = await getAllCategories();

    res.json(categories);
  } catch (error) {
    handleError(res, error);
  }
};

export const getKnowledgeCategory = async (req, res) => {
  try {
    const { id } = req?.query;
    
    // Use service to get category by ID
    const category = await getCategoryById(id);

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
    const { customId } = req?.user;
    
    const data = {
      ...payload,
      created_by: customId,
    };
    
    // Use service to create category
    const category = await createCategory(data);
    
    res.json(category);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateKnowledgeCategory = async (req, res) => {
  try {
    const { id } = req?.query;
    const payload = req?.body;
    
    // Use service to update category
    const result = await updateCategory(id, payload);
    
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteKnowledgeCategory = async (req, res) => {
  try {
    const { id } = req?.query;
    
    // Use service to delete category
    const result = await deleteCategory(id);
    
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};
