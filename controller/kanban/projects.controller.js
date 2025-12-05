const { handleError } = require("@/utils/helper/controller-helper");
const KanbanProject = require("@/models/kanban/projects.model");
const KanbanProjectMember = require("@/models/kanban/project-members.model");
const KanbanProjectWatcher = require("@/models/kanban/project-watchers.model");
const KanbanLabel = require("@/models/kanban/labels.model");

/**
 * Get all projects accessible by user (as member or watcher)
 */
const getProjects = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { archived = "false" } = req?.query;

    const isArchived = archived === "true";

    const projects = await KanbanProject.query()
      .where((builder) => {
        builder
          .whereExists(
            KanbanProject.relatedQuery("members").where("user_id", userId)
          )
          .orWhereExists(
            KanbanProject.relatedQuery("watchers").where("user_id", userId)
          );
      })
      .where("is_archived", isArchived)
      .withGraphFetched("[creator(simpleWithImage), members.[user(simpleWithImage)]]")
      .orderBy("created_at", "desc");

    // Add user role info to each project
    const projectsWithRole = await Promise.all(
      projects.map(async (project) => {
        const memberRole = await KanbanProjectMember.getUserRole(project.id, userId);
        const isWatcher = await KanbanProjectWatcher.isWatcher(project.id, userId);
        
        return {
          ...project,
          my_role: memberRole || (isWatcher ? "watcher" : null),
          is_watcher: isWatcher,
        };
      })
    );

    res.json(projectsWithRole);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get project detail by ID
 */
const getProject = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;

    const project = await KanbanProject.query()
      .findById(projectId)
      .withGraphFetched(`[
        creator(simpleWithImage),
        members.[user(simpleWithImage)],
        watchers.[user(simpleWithImage)],
        columns(orderByPosition),
        labels
      ]`)
      .modifiers({
        orderByPosition(builder) {
          builder.orderBy("position", "asc");
        },
      });

    if (!project) {
      return res.status(404).json({ message: "Project tidak ditemukan" });
    }

    // Check access
    const isMember = await KanbanProjectMember.isMember(projectId, userId);
    const isWatcher = await KanbanProjectWatcher.isWatcher(projectId, userId);

    if (!isMember && !isWatcher) {
      return res.status(403).json({ message: "Anda tidak memiliki akses ke project ini" });
    }

    const memberRole = await KanbanProjectMember.getUserRole(projectId, userId);

    res.json({
      ...project,
      my_role: memberRole || (isWatcher ? "watcher" : null),
      is_watcher: isWatcher,
      can_edit: memberRole === "owner" || memberRole === "admin",
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Create new project with default columns and labels
 */
const createProject = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { name, description, icon, color, visibility } = req?.body;

    if (!name) {
      return res.status(400).json({ message: "Nama project wajib diisi" });
    }

    const project = await KanbanProject.createWithDefaults({
      name,
      description,
      icon,
      color,
      visibility,
      createdBy: userId,
    });

    // Create default labels
    await KanbanLabel.createDefaults(project.id);

    const result = await KanbanProject.query()
      .findById(project.id)
      .withGraphFetched("[creator(simpleWithImage), columns, labels]");

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update project
 */
const updateProject = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;
    const { name, description, icon, color, visibility, is_archived } = req?.body;

    // Check permission
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(projectId, userId);
    if (!isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengubah project ini" });
    }

    const project = await KanbanProject.query()
      .patchAndFetchById(projectId, {
        name,
        description,
        icon,
        color,
        visibility,
        is_archived,
      });

    res.json(project);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete project (only owner can delete)
 */
const deleteProject = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;

    // Check if user is owner
    const memberRole = await KanbanProjectMember.getUserRole(projectId, userId);
    if (memberRole !== "owner") {
      return res.status(403).json({ message: "Hanya owner yang dapat menghapus project" });
    }

    await KanbanProject.query().deleteById(projectId);

    res.json({ message: "Project berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Archive/Unarchive project
 */
const toggleArchiveProject = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;

    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(projectId, userId);
    if (!isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    const project = await KanbanProject.query().findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project tidak ditemukan" });
    }

    const updated = await KanbanProject.query()
      .patchAndFetchById(projectId, {
        is_archived: !project.is_archived,
      });

    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  toggleArchiveProject,
};

