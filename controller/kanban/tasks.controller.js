const { handleError } = require("@/utils/helper/controller-helper");
const KanbanTask = require("@/models/kanban/tasks.model");
const KanbanColumn = require("@/models/kanban/columns.model");
const KanbanSubtask = require("@/models/kanban/subtasks.model");
const KanbanProjectMember = require("@/models/kanban/project-members.model");
const KanbanProjectWatcher = require("@/models/kanban/project-watchers.model");
const KanbanTaskActivity = require("@/models/kanban/task-activities.model");
const KanbanTaskLabel = require("@/models/kanban/task-labels.model");
const KanbanTaskAssignee = require("@/models/kanban/task-assignees.model");

/**
 * Get all tasks for a project (board view)
 */
const getTasks = async (req, res) => {
  try {
    const { projectId } = req?.query;

    const columns = await KanbanColumn.query()
      .where("project_id", projectId)
      .orderBy("position", "asc");

    // Get tasks for each column
    const columnsWithTasks = await Promise.all(
      columns.map(async (column) => {
        const tasks = await KanbanTask.query()
          .where("column_id", column.id)
          .modify("withCounts")
          .withGraphFetched(
            "[assignee(simpleWithImage), assignees(simpleWithImage), labels]"
          )
          .orderBy("position", "asc");

        return {
          ...column,
          tasks,
        };
      })
    );

    res.json(columnsWithTasks);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get task detail
 */
const getTask = async (req, res) => {
  try {
    const { taskId } = req?.query;

    const task = await KanbanTask.query()
      .findById(taskId)
      .withGraphFetched(
        `[
        project(simpleSelect),
        column,
        assignee(simpleWithImage),
        assignees(simpleWithImage),
        creator(simpleWithImage),
        labels,
        subtasks,
        attachments.[uploader(simpleWithImage)],
        comments.[user(simpleWithImage)],
        time_entries.[user(simpleWithImage)],
        activities.[user(simpleWithImage)]
      ]`
      )
      .modifiers({
        simpleSelect(builder) {
          builder.select("id", "name", "icon", "color");
        },
      });

    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // Get subtask progress
    const subtaskProgress = await KanbanSubtask.getProgress(taskId);

    res.json({
      ...task,
      subtask_progress: subtaskProgress,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Create new task
 */
const createTask = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;
    const {
      column_id,
      title,
      description,
      priority,
      start_date,
      due_date,
      estimated_hours,
      assigned_to,
      assignee_ids = [],
      label_ids = [],
      ai_subtasks = [], // AI generated subtasks
    } = req?.body;

    // Check if user is member
    const isMember = await KanbanProjectMember.isMember(projectId, userId);
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Anda tidak memiliki akses untuk membuat task" });
    }

    if (!title) {
      return res.status(400).json({ message: "Judul task wajib diisi" });
    }

    // Get max position in column
    const maxPosition = await KanbanTask.query()
      .where("column_id", column_id)
      .max("position as max")
      .first();

    const task = await KanbanTask.query().insert({
      project_id: projectId,
      column_id,
      title,
      description,
      priority: priority || "medium",
      start_date,
      due_date,
      estimated_hours,
      assigned_to:
        assigned_to || (assignee_ids.length === 1 ? assignee_ids[0] : null),
      created_by: userId,
      position: (maxPosition?.max || 0) + 1,
    });

    // Add labels
    if (label_ids.length > 0) {
      await KanbanTaskLabel.syncLabels(task.id, label_ids, userId);
    }

    // Add AI-generated subtasks
    if (ai_subtasks.length > 0) {
      for (let i = 0; i < ai_subtasks.length; i++) {
        await KanbanSubtask.query().insert({
          task_id: task.id,
          title: ai_subtasks[i],
          position: i + 1,
        });
      }
    }

    // Add assignees (multiple)
    if (assignee_ids.length > 0) {
      await KanbanTaskAssignee.syncAssignees({
        taskId: task.id,
        userIds: assignee_ids,
        assignedBy: userId,
      });
    } else if (assigned_to) {
      // Backward compatibility: single assignee
      await KanbanTaskAssignee.addAssignee({
        taskId: task.id,
        userId: assigned_to,
        assignedBy: userId,
      });
    }

    // Log activity
    await KanbanTaskActivity.log({
      taskId: task.id,
      userId,
      action: "created",
      description: `Task "${title}" dibuat`,
    });

    const result = await KanbanTask.query()
      .findById(task.id)
      .withGraphFetched(
        "[assignee(simpleWithImage), assignees(simpleWithImage), labels]"
      );

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update task
 */
const updateTask = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { taskId } = req?.query;
    const {
      title,
      description,
      priority,
      start_date,
      due_date,
      estimated_hours,
      assigned_to,
      assignee_ids,
      label_ids,
    } = req?.body;

    const task = await KanbanTask.query().findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // Check permission
    const isMember = await KanbanProjectMember.isMember(
      task.project_id,
      userId
    );
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Track changes for activity log
    const changes = [];
    if (priority && priority !== task.priority) {
      changes.push({ field: "priority", old: task.priority, new: priority });
    }
    if (due_date !== undefined && due_date !== task.due_date) {
      changes.push({ field: "due_date", old: task.due_date, new: due_date });
    }

    // Build update object
    const updateData = {
      title,
      description,
      priority,
      start_date,
      due_date,
      estimated_hours,
    };

    // Handle assignees
    if (assignee_ids !== undefined) {
      // Update multiple assignees
      await KanbanTaskAssignee.syncAssignees({
        taskId,
        userIds: assignee_ids,
        assignedBy: userId,
      });
      // Also update assigned_to for backward compatibility (first assignee)
      updateData.assigned_to = assignee_ids.length > 0 ? assignee_ids[0] : null;
    } else if (assigned_to !== undefined) {
      // Backward compatibility: single assignee
      updateData.assigned_to = assigned_to;
      if (assigned_to) {
        await KanbanTaskAssignee.syncAssignees({
          taskId,
          userIds: [assigned_to],
          assignedBy: userId,
        });
      } else {
        await KanbanTaskAssignee.syncAssignees({
          taskId,
          userIds: [],
          assignedBy: userId,
        });
      }
    }

    await KanbanTask.query().patchAndFetchById(taskId, updateData);

    // Update labels if provided
    if (label_ids !== undefined) {
      await KanbanTaskLabel.syncLabels(taskId, label_ids, userId);
    }

    // Log activity for each change
    for (const change of changes) {
      let action = "updated";
      if (change.field === "priority") action = "priority_changed";
      if (change.field === "due_date") action = "due_date_changed";

      await KanbanTaskActivity.log({
        taskId,
        userId,
        action,
        oldValue: { [change.field]: change.old },
        newValue: { [change.field]: change.new },
      });
    }

    const result = await KanbanTask.query()
      .findById(taskId)
      .withGraphFetched(
        "[assignee(simpleWithImage), assignees(simpleWithImage), labels]"
      );

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete task
 */
const deleteTask = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { taskId } = req?.query;

    const task = await KanbanTask.query().findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // Check permission (admin/owner or task creator)
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(
      task.project_id,
      userId
    );
    if (!isAdminOrOwner && task.created_by !== userId) {
      return res
        .status(403)
        .json({
          message: "Anda tidak memiliki akses untuk menghapus task ini",
        });
    }

    await KanbanTask.query().deleteById(taskId);

    res.json({ message: "Task berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Move task to different column/position
 */
const moveTask = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { taskId } = req?.query;
    const { column_id, position } = req?.body;

    const task = await KanbanTask.query().findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // Check permission
    const isMember = await KanbanProjectMember.isMember(
      task.project_id,
      userId
    );
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    const result = await KanbanTask.moveTask(taskId, {
      columnId: column_id,
      position,
      userId,
    });

    // Check if moved to done column
    const column = await KanbanColumn.query().findById(column_id);
    if (column?.is_done_column && !task.completed_at) {
      await KanbanTask.query()
        .patch({ completed_at: new Date().toISOString() })
        .where("id", taskId);
    } else if (!column?.is_done_column && task.completed_at) {
      await KanbanTask.query()
        .patch({ completed_at: null })
        .where("id", taskId);
    }

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get my assigned tasks
 */
const getMyTasks = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;

    // Get tasks from task_assignees table
    let query = KanbanTask.query()
      .whereExists(
        KanbanTaskAssignee.query()
          .whereRaw("kanban.task_assignees.task_id = kanban.tasks.id")
          .where("user_id", userId)
      )
      .whereNull("completed_at")
      .withGraphFetched(
        "[project(simpleSelect), column, labels, assignees(simpleWithImage)]"
      )
      .orderBy("due_date", "asc");

    if (projectId) {
      query = query.where("project_id", projectId);
    }

    const tasks = await query;

    res.json(tasks);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get overdue tasks
 */
const getOverdueTasks = async (req, res) => {
  try {
    const { projectId } = req?.query;

    const tasks = await KanbanTask.getOverdueTasks(projectId);

    res.json(tasks);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get tasks created by me
 */
const getMyCreatedTasks = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;

    let query = KanbanTask.query()
      .where("created_by", userId)
      .withGraphFetched(
        "[project(simpleSelect), column, labels, assignees(simpleWithImage)]"
      )
      .modifiers({
        simpleSelect(builder) {
          builder.select("id", "name", "icon", "color");
        },
      })
      .orderBy("created_at", "desc");

    if (projectId) {
      query = query.where("project_id", projectId);
    }

    const tasks = await query;

    res.json(tasks);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get my completed tasks (assigned to me and completed)
 */
const getMyCompletedTasks = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;

    let query = KanbanTask.query()
      .whereExists(
        KanbanTaskAssignee.query()
          .whereRaw("kanban.task_assignees.task_id = kanban.tasks.id")
          .where("user_id", userId)
      )
      .whereNotNull("completed_at")
      .withGraphFetched(
        "[project(simpleSelect), column, labels, assignees(simpleWithImage)]"
      )
      .modifiers({
        simpleSelect(builder) {
          builder.select("id", "name", "icon", "color");
        },
      })
      .orderBy("completed_at", "desc");

    if (projectId) {
      query = query.where("project_id", projectId);
    }

    const tasks = await query;

    res.json(tasks);
  } catch (error) {
    handleError(res, error);
  }
};

// ==========================================
// SUBTASKS
// ==========================================

/**
 * Create subtask
 */
const createSubtask = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { taskId } = req?.query;
    const { title } = req?.body;

    const task = await KanbanTask.query().findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // Check permission
    const isMember = await KanbanProjectMember.isMember(
      task.project_id,
      userId
    );
    const canComment = await KanbanProjectWatcher.canComment(
      task.project_id,
      userId
    );

    if (!isMember && !canComment) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Get max position
    const maxPosition = await KanbanSubtask.query()
      .where("task_id", taskId)
      .max("position as max")
      .first();

    const subtask = await KanbanSubtask.query().insert({
      task_id: taskId,
      title,
      position: (maxPosition?.max || 0) + 1,
    });

    // Log activity
    await KanbanTaskActivity.log({
      taskId,
      userId,
      action: "subtask_added",
      newValue: { subtask_id: subtask.id, title },
    });

    res.json(subtask);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Toggle subtask completion
 */
const toggleSubtask = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { taskId, subtaskId } = req?.query;

    const subtask = await KanbanSubtask.query().findById(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask tidak ditemukan" });
    }

    const result = await subtask.toggle(userId);
    const progress = await KanbanSubtask.getProgress(taskId);

    res.json({
      subtask: result,
      progress,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update subtask
 */
const updateSubtask = async (req, res) => {
  try {
    const { subtaskId } = req?.query;
    const { title } = req?.body;

    const subtask = await KanbanSubtask.query().patchAndFetchById(subtaskId, {
      title,
    });

    res.json(subtask);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete subtask
 */
const deleteSubtask = async (req, res) => {
  try {
    const { subtaskId } = req?.query;

    await KanbanSubtask.query().deleteById(subtaskId);

    res.json({ message: "Subtask berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Reorder subtasks
 */
const reorderSubtasks = async (req, res) => {
  try {
    const { taskId } = req?.query;
    const { subtask_orders } = req?.body;

    await KanbanSubtask.reorder(taskId, subtask_orders);

    const subtasks = await KanbanSubtask.query()
      .where("task_id", taskId)
      .orderBy("position", "asc");

    res.json(subtasks);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  // Tasks
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getMyTasks,
  getMyCreatedTasks,
  getMyCompletedTasks,
  getOverdueTasks,
  // Subtasks
  createSubtask,
  toggleSubtask,
  updateSubtask,
  deleteSubtask,
  reorderSubtasks,
};
