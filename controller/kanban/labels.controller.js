const { handleError } = require("@/utils/helper/controller-helper");
const KanbanLabel = require("@/models/kanban/labels.model");
const KanbanProjectMember = require("@/models/kanban/project-members.model");

/**
 * Get all labels for a project
 */
const getLabels = async (req, res) => {
  try {
    const { projectId } = req?.query;

    const labels = await KanbanLabel.getLabelsWithCount(projectId);

    res.json(labels);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Create new label
 */
const createLabel = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;
    const { name, color } = req?.body;

    // Check permission
    const isMember = await KanbanProjectMember.isMember(projectId, userId);
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    if (!name) {
      return res.status(400).json({ message: "Nama label wajib diisi" });
    }

    // Check duplicate name
    const existing = await KanbanLabel.query()
      .where("project_id", projectId)
      .where("name", name)
      .first();

    if (existing) {
      return res
        .status(400)
        .json({ message: "Label dengan nama tersebut sudah ada" });
    }

    const label = await KanbanLabel.query().insert({
      project_id: projectId,
      name,
      color: color || "#3B82F6",
    });

    res.json(label);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update label
 */
const updateLabel = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId, labelId } = req?.query;
    const { name, color } = req?.body;

    // Check permission
    const isMember = await KanbanProjectMember.isMember(projectId, userId);
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Check duplicate name if name changed
    if (name) {
      const existing = await KanbanLabel.query()
        .where("project_id", projectId)
        .where("name", name)
        .whereNot("id", labelId)
        .first();

      if (existing) {
        return res
          .status(400)
          .json({ message: "Label dengan nama tersebut sudah ada" });
      }
    }

    const label = await KanbanLabel.query().patchAndFetchById(labelId, {
      name,
      color,
    });

    res.json(label);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete label
 */
const deleteLabel = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId, labelId } = req?.query;

    // Check permission
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(
      projectId,
      userId
    );
    if (!isAdminOrOwner) {
      return res
        .status(403)
        .json({ message: "Anda tidak memiliki akses untuk menghapus label" });
    }

    await KanbanLabel.query().deleteById(labelId);

    res.json({ message: "Label berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getLabels,
  createLabel,
  updateLabel,
  deleteLabel,
};
