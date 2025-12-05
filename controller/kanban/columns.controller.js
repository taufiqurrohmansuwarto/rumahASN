const { handleError } = require("@/utils/helper/controller-helper");
const KanbanColumn = require("@/models/kanban/columns.model");
const KanbanProjectMember = require("@/models/kanban/project-members.model");

/**
 * Get all columns for a project
 */
const getColumns = async (req, res) => {
  try {
    const { projectId } = req?.query;

    const columns = await KanbanColumn.getColumnsWithTaskCount(projectId);

    res.json(columns);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Create new column
 */
const createColumn = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;
    const { name, color, wip_limit, is_done_column } = req?.body;

    // Check permission
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(projectId, userId);
    if (!isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk menambah kolom" });
    }

    if (!name) {
      return res.status(400).json({ message: "Nama kolom wajib diisi" });
    }

    // Get max position
    const maxPosition = await KanbanColumn.query()
      .where("project_id", projectId)
      .max("position as max")
      .first();

    const column = await KanbanColumn.query().insert({
      project_id: projectId,
      name,
      color: color || "#6B7280",
      position: (maxPosition?.max || 0) + 1,
      wip_limit,
      is_done_column: is_done_column || false,
    });

    res.json(column);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update column
 */
const updateColumn = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId, columnId } = req?.query;
    const { name, color, wip_limit, is_done_column } = req?.body;

    // Check permission
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(projectId, userId);
    if (!isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    const column = await KanbanColumn.query()
      .patchAndFetchById(columnId, {
        name,
        color,
        wip_limit,
        is_done_column,
      });

    res.json(column);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete column
 */
const deleteColumn = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId, columnId } = req?.query;

    // Check permission
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(projectId, userId);
    if (!isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Check if column has tasks
    const column = await KanbanColumn.query()
      .findById(columnId)
      .withGraphFetched("tasks");

    if (column?.tasks?.length > 0) {
      return res.status(400).json({ 
        message: "Tidak dapat menghapus kolom yang masih memiliki task. Pindahkan task terlebih dahulu." 
      });
    }

    await KanbanColumn.query().deleteById(columnId);

    res.json({ message: "Kolom berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Reorder columns
 */
const reorderColumns = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;
    const { column_orders } = req?.body; // Array of { id, position }

    // Check permission
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(projectId, userId);
    if (!isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    if (!Array.isArray(column_orders)) {
      return res.status(400).json({ message: "Format data tidak valid" });
    }

    await KanbanColumn.reorder(projectId, column_orders);

    const columns = await KanbanColumn.getColumnsWithTaskCount(projectId);

    res.json(columns);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
};

