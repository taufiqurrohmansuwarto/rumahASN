const { handleError } = require("@/utils/helper/controller-helper");
const KanbanTask = require("@/models/kanban/tasks.model");
const KanbanTaskComment = require("@/models/kanban/task-comments.model");
const KanbanProjectMember = require("@/models/kanban/project-members.model");
const KanbanProjectWatcher = require("@/models/kanban/project-watchers.model");

/**
 * Get comments for a task
 */
const getComments = async (req, res) => {
  try {
    const { taskId } = req?.query;
    const { page = 1, limit = 20 } = req?.query;

    const result = await KanbanTaskComment.getByTask(taskId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      comments: result.results,
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Add comment to task
 */
const addComment = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { taskId } = req?.query;
    const { content, mentions = [] } = req?.body;

    const task = await KanbanTask.query().findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // Check permission (member or watcher with can_comment)
    const isMember = await KanbanProjectMember.isMember(task.project_id, userId);
    const canComment = await KanbanProjectWatcher.canComment(task.project_id, userId);

    if (!isMember && !canComment) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk menambah komentar" });
    }

    if (!content?.trim()) {
      return res.status(400).json({ message: "Komentar tidak boleh kosong" });
    }

    const comment = await KanbanTaskComment.addComment({
      taskId,
      userId,
      content,
      mentions,
    });

    res.json(comment);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update comment
 */
const updateComment = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { commentId } = req?.query;
    const { content, mentions = [] } = req?.body;

    const comment = await KanbanTaskComment.query().findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    }

    // Only comment owner can edit
    if (comment.user_id !== userId) {
      return res.status(403).json({ message: "Anda tidak dapat mengedit komentar ini" });
    }

    const updated = await comment.updateContent(content, mentions);

    const result = await KanbanTaskComment.query()
      .findById(updated.id)
      .withGraphFetched("user(simpleWithImage)");

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete comment
 */
const deleteComment = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { commentId } = req?.query;

    const comment = await KanbanTaskComment.query()
      .findById(commentId)
      .withGraphFetched("task");
    
    if (!comment) {
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    }

    // Owner of comment or project admin can delete
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(
      comment.task.project_id,
      userId
    );

    if (comment.user_id !== userId && !isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak dapat menghapus komentar ini" });
    }

    await KanbanTaskComment.query().deleteById(commentId);

    res.json({ message: "Komentar berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get recent comments for project
 */
const getRecentComments = async (req, res) => {
  try {
    const { projectId } = req?.query;
    const { limit = 10 } = req?.query;

    const comments = await KanbanTaskComment.getRecentByProject(
      projectId,
      parseInt(limit)
    );

    res.json(comments);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  getRecentComments,
};

