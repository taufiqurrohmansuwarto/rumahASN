const KnowledgeCategory = require("@/models/knowledge/categories.model");

// ===== CATEGORY SERVICES =====

/**
 * Get all knowledge categories
 */
export const getAllCategories = async () => {
  return await KnowledgeCategory.query().select("*").orderBy("name", "asc");
};

/**
 * Get category by ID
 */
export const getCategoryById = async (categoryId) => {
  return await KnowledgeCategory.query()
    .findById(categoryId)
    .select("id", "name", "description", "color", "icon");
};

/**
 * Get categories with content count
 */
export const getCategoriesWithCount = async () => {
  return await KnowledgeCategory.query()
    .select(
      "knowledge.categories.id",
      "knowledge.categories.name",
      "knowledge.categories.description",
      "knowledge.categories.color",
      "knowledge.categories.icon"
    )
    .withGraphFetched("[contents(published)]")
    .modifyGraph("contents", (builder) => {
      builder.select("id").where("status", "published");
    })
    .orderBy("name", "asc");
};

/**
 * Create new category (admin only)
 */
export const createCategory = async (categoryData) => {
  return await KnowledgeCategory.query().insert(categoryData);
};

/**
 * Update category (admin only)
 */
export const updateCategory = async (categoryId, categoryData) => {
  const category = await KnowledgeCategory.query().findById(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  return await KnowledgeCategory.query()
    .findById(categoryId)
    .patch(categoryData);
};

/**
 * Delete category (admin only)
 */
export const deleteCategory = async (categoryId) => {
  const category = await KnowledgeCategory.query().findById(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  // Check if category has associated contents
  const contentCount = await category.$relatedQuery("contents").resultSize();

  if (contentCount > 0) {
    throw new Error("Cannot delete category with existing contents");
  }

  return await KnowledgeCategory.query().deleteById(categoryId);
};
