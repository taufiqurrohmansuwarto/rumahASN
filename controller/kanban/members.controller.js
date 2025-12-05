const { handleError } = require("@/utils/helper/controller-helper");
const KanbanProjectMember = require("@/models/kanban/project-members.model");
const KanbanProjectWatcher = require("@/models/kanban/project-watchers.model");

// ==========================================
// MEMBERS
// ==========================================

/**
 * Get all members of a project
 */
const getMembers = async (req, res) => {
  try {
    const { projectId } = req?.query;

    const members = await KanbanProjectMember.query()
      .where("project_id", projectId)
      .withGraphFetched("user(simpleWithImage)")
      .orderBy("created_at", "asc");

    res.json(members);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Add member to project
 */
const addMember = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;
    const { user_id, role = "member" } = req?.body;

    // Check permission
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(projectId, userId);
    if (!isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk menambah member" });
    }

    // Check if already member
    const existing = await KanbanProjectMember.query()
      .where("project_id", projectId)
      .where("user_id", user_id)
      .first();

    if (existing) {
      return res.status(400).json({ message: "User sudah menjadi member project ini" });
    }

    // Prevent adding owner role
    if (role === "owner") {
      return res.status(400).json({ message: "Tidak dapat menambahkan owner baru" });
    }

    const member = await KanbanProjectMember.query().insert({
      project_id: projectId,
      user_id,
      role,
    });

    const result = await KanbanProjectMember.query()
      .findById(member.id)
      .withGraphFetched("user(simpleWithImage)");

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update member role
 */
const updateMember = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId, memberId } = req?.query;
    const { role } = req?.body;

    // Check permission
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(projectId, userId);
    if (!isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    const member = await KanbanProjectMember.query().findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member tidak ditemukan" });
    }

    // Cannot change owner role
    if (member.role === "owner") {
      return res.status(400).json({ message: "Tidak dapat mengubah role owner" });
    }

    // Cannot set someone as owner
    if (role === "owner") {
      return res.status(400).json({ message: "Tidak dapat menetapkan owner baru" });
    }

    const updated = await KanbanProjectMember.query()
      .patchAndFetchById(memberId, { role });

    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Remove member from project
 */
const removeMember = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId, memberId } = req?.query;

    // Check permission
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(projectId, userId);
    if (!isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    const member = await KanbanProjectMember.query().findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member tidak ditemukan" });
    }

    // Cannot remove owner
    if (member.role === "owner") {
      return res.status(400).json({ message: "Tidak dapat menghapus owner dari project" });
    }

    await KanbanProjectMember.query().deleteById(memberId);

    res.json({ message: "Member berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

// ==========================================
// WATCHERS
// ==========================================

/**
 * Get all watchers of a project
 */
const getWatchers = async (req, res) => {
  try {
    const { projectId } = req?.query;

    const watchers = await KanbanProjectWatcher.query()
      .where("project_id", projectId)
      .withGraphFetched("user(simpleWithImage)")
      .orderBy("created_at", "asc");

    res.json(watchers);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Add watcher to project
 */
const addWatcher = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;
    const { user_id, can_comment = true, can_view_reports = true } = req?.body;

    // Check permission
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(projectId, userId);
    if (!isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk menambah watcher" });
    }

    // Check if already watcher or member
    const existingWatcher = await KanbanProjectWatcher.query()
      .where("project_id", projectId)
      .where("user_id", user_id)
      .first();

    if (existingWatcher) {
      return res.status(400).json({ message: "User sudah menjadi watcher project ini" });
    }

    const existingMember = await KanbanProjectMember.query()
      .where("project_id", projectId)
      .where("user_id", user_id)
      .first();

    if (existingMember) {
      return res.status(400).json({ message: "User sudah menjadi member project ini" });
    }

    const watcher = await KanbanProjectWatcher.query().insert({
      project_id: projectId,
      user_id,
      can_comment,
      can_view_reports,
    });

    const result = await KanbanProjectWatcher.query()
      .findById(watcher.id)
      .withGraphFetched("user(simpleWithImage)");

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update watcher permissions
 */
const updateWatcher = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId, watcherId } = req?.query;
    const { can_comment, can_view_reports } = req?.body;

    // Check permission
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(projectId, userId);
    if (!isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    const updated = await KanbanProjectWatcher.query()
      .patchAndFetchById(watcherId, {
        can_comment,
        can_view_reports,
      });

    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Remove watcher from project
 */
const removeWatcher = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId, watcherId } = req?.query;

    // Check permission
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(projectId, userId);
    if (!isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    await KanbanProjectWatcher.query().deleteById(watcherId);

    res.json({ message: "Watcher berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  // Members
  getMembers,
  addMember,
  updateMember,
  removeMember,
  // Watchers
  getWatchers,
  addWatcher,
  updateWatcher,
  removeWatcher,
};

