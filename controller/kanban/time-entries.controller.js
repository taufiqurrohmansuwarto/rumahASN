const { handleError } = require("@/utils/helper/controller-helper");
const KanbanTask = require("@/models/kanban/tasks.model");
const KanbanTimeEntry = require("@/models/kanban/time-entries.model");
const KanbanProjectMember = require("@/models/kanban/project-members.model");

/**
 * Get time entries for a task
 */
const getTimeEntriesByTask = async (req, res) => {
  try {
    const { taskId } = req?.query;

    const entries = await KanbanTimeEntry.getByTask(taskId);
    const totalHours = await KanbanTimeEntry.getTotalHoursForTask(taskId);

    res.json({
      entries,
      total_hours: totalHours,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Log time entry
 */
const logTimeEntry = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { taskId } = req?.query;
    const { hours, description, logged_date } = req?.body;

    const task = await KanbanTask.query().findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // Check permission
    const isMember = await KanbanProjectMember.isMember(task.project_id, userId);
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    if (!hours || hours <= 0) {
      return res.status(400).json({ message: "Jam kerja harus lebih dari 0" });
    }

    const entry = await KanbanTimeEntry.logTime({
      taskId,
      userId,
      hours,
      description,
      loggedDate: logged_date,
    });

    res.json(entry);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update time entry
 */
const updateTimeEntry = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { entryId } = req?.query;
    const { hours, description, logged_date } = req?.body;

    const entry = await KanbanTimeEntry.query().findById(entryId);
    if (!entry) {
      return res.status(404).json({ message: "Time entry tidak ditemukan" });
    }

    // Only owner can update
    if (entry.user_id !== userId) {
      return res.status(403).json({ message: "Anda tidak dapat mengubah time entry ini" });
    }

    // Update actual_hours on task (adjust difference)
    if (hours !== undefined) {
      const task = await KanbanTask.query().findById(entry.task_id);
      const difference = parseFloat(hours) - parseFloat(entry.hours);
      const newActualHours = parseFloat(task.actual_hours || 0) + difference;
      await task.$query().patch({ actual_hours: Math.max(0, newActualHours) });
    }

    const updated = await KanbanTimeEntry.query()
      .patchAndFetchById(entryId, {
        hours,
        description,
        logged_date,
      });

    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete time entry
 */
const deleteTimeEntry = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { entryId } = req?.query;

    const entry = await KanbanTimeEntry.query().findById(entryId);
    if (!entry) {
      return res.status(404).json({ message: "Time entry tidak ditemukan" });
    }

    // Only owner can delete
    if (entry.user_id !== userId) {
      return res.status(403).json({ message: "Anda tidak dapat menghapus time entry ini" });
    }

    // Update actual_hours on task
    const task = await KanbanTask.query().findById(entry.task_id);
    const newActualHours = parseFloat(task.actual_hours || 0) - parseFloat(entry.hours);
    await task.$query().patch({ actual_hours: Math.max(0, newActualHours) });

    await KanbanTimeEntry.query().deleteById(entryId);

    res.json({ message: "Time entry berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get my time entries
 */
const getMyTimeEntries = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { start_date, end_date } = req?.query;

    const entries = await KanbanTimeEntry.getByUser(userId, {
      startDate: start_date,
      endDate: end_date,
    });

    // Calculate total
    const totalHours = entries.reduce(
      (sum, entry) => sum + parseFloat(entry.hours || 0),
      0
    );

    res.json({
      entries,
      total_hours: totalHours,
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getTimeEntriesByTask,
  logTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getMyTimeEntries,
};

