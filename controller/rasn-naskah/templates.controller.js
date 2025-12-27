/**
 * Templates Controller - RASN Naskah
 * CRUD operations untuk template naskah dinas
 */

const { handleError } = require("@/utils/helper/controller-helper");
const Templates = require("@/models/rasn-naskah/templates.model");

/**
 * Get all templates (public + user's own)
 */
const getTemplates = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { category, search, my_templates = "false" } = req?.query;

    let query = Templates.query();

    if (my_templates === "true") {
      // Only user's templates
      query = query.where("created_by", userId);
    } else {
      // Public templates + user's own
      query = query.where((builder) => {
        builder.where("is_public", true).orWhere("created_by", userId);
      });
    }

    // Filter by category
    if (category) {
      query = query.where("category", category);
    }

    // Search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("name", "ilike", `%${search}%`)
          .orWhere("description", "ilike", `%${search}%`);
      });
    }

    const templates = await query
      .withGraphFetched("creator(simpleWithImage)")
      .orderBy("usage_count", "desc");

    // Add is_owner flag
    const templatesWithOwner = templates.map((t) => ({
      ...t,
      is_owner: t.created_by === userId,
    }));

    res.json(templatesWithOwner);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get single template
 */
const getTemplate = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { templateId } = req?.query;

    const template = await Templates.query()
      .findById(templateId)
      .withGraphFetched("creator(simpleWithImage)");

    if (!template) {
      return res.status(404).json({ message: "Template tidak ditemukan" });
    }

    // Check access (public or owner)
    if (!template.is_public && template.created_by !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    res.json({
      ...template,
      is_owner: template.created_by === userId,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Create new template
 */
const createTemplate = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const {
      name,
      category,
      description,
      content,
      structure,
      placeholders,
      is_public = false,
    } = req?.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Nama template wajib diisi" });
    }

    if (!category) {
      return res.status(400).json({ message: "Kategori wajib dipilih" });
    }

    if (!content) {
      return res.status(400).json({ message: "Konten template wajib diisi" });
    }

    const template = await Templates.query().insert({
      name,
      category,
      description,
      content,
      structure: structure ? JSON.stringify(structure) : null,
      placeholders: placeholders ? JSON.stringify(placeholders) : null,
      is_public,
      created_by: userId,
      usage_count: 0,
    });

    res.status(201).json(template);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update template
 */
const updateTemplate = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { templateId } = req?.query;
    const { name, category, description, content, structure, placeholders, is_public } =
      req?.body;

    const template = await Templates.query().findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template tidak ditemukan" });
    }

    // Only owner can update
    if (template.created_by !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (structure !== undefined)
      updateData.structure = JSON.stringify(structure);
    if (placeholders !== undefined)
      updateData.placeholders = JSON.stringify(placeholders);
    if (is_public !== undefined) updateData.is_public = is_public;

    const updatedTemplate = await Templates.query().patchAndFetchById(
      templateId,
      updateData
    );

    res.json(updatedTemplate);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete template
 */
const deleteTemplate = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { templateId } = req?.query;

    const template = await Templates.query().findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template tidak ditemukan" });
    }

    // Only owner can delete
    if (template.created_by !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    await Templates.query().deleteById(templateId);

    res.json({ message: "Template berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get template categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = [
      { value: "surat_dinas", label: "Surat Dinas" },
      { value: "nota_dinas", label: "Nota Dinas" },
      { value: "surat_keputusan", label: "Surat Keputusan" },
      { value: "surat_edaran", label: "Surat Edaran" },
      { value: "surat_tugas", label: "Surat Tugas" },
      { value: "surat_undangan", label: "Surat Undangan" },
      { value: "surat_perintah", label: "Surat Perintah" },
      { value: "berita_acara", label: "Berita Acara" },
      { value: "laporan", label: "Laporan" },
      { value: "proposal", label: "Proposal" },
      { value: "telaahan_staf", label: "Telaahan Staf" },
      { value: "disposisi", label: "Disposisi" },
      { value: "memo", label: "Memo" },
      { value: "lainnya", label: "Lainnya" },
    ];

    res.json(categories);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Duplicate template
 */
const duplicateTemplate = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { templateId } = req?.query;
    const { name } = req?.body;

    const template = await Templates.query().findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template tidak ditemukan" });
    }

    // Check access
    if (!template.is_public && template.created_by !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const newTemplate = await Templates.query().insert({
      name: name || `${template.name} (Copy)`,
      category: template.category,
      description: template.description,
      content: template.content,
      structure: template.structure,
      placeholders: template.placeholders,
      is_public: false, // Duplicated template is private by default
      created_by: userId,
      usage_count: 0,
    });

    res.status(201).json(newTemplate);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getCategories,
  duplicateTemplate,
};

