const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KanbanTimeEntry extends Model {
  static get tableName() {
    return "kanban.time_entries";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const KanbanTask = require("@/models/kanban/tasks.model");

    return {
      task: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanTask,
        join: {
          from: "kanban.time_entries.task_id",
          to: "kanban.tasks.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "kanban.time_entries.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  // Log time entry
  static async logTime({ taskId, userId, hours, description, loggedDate }) {
    const entry = await KanbanTimeEntry.query().insert({
      task_id: taskId,
      user_id: userId,
      hours,
      description,
      logged_date: loggedDate || new Date().toISOString().split("T")[0],
    });

    // Update actual_hours on task
    const KanbanTask = require("@/models/kanban/tasks.model");
    const task = await KanbanTask.query().findById(taskId);
    if (task) {
      const newActualHours = parseFloat(task.actual_hours || 0) + parseFloat(hours);
      await task.$query().patch({ actual_hours: newActualHours });
    }

    // Log activity
    const KanbanTaskActivity = require("@/models/kanban/task-activities.model");
    await KanbanTaskActivity.query().insert({
      task_id: taskId,
      user_id: userId,
      action: "time_logged",
      new_value: { hours, description, logged_date: loggedDate },
    });

    return entry.$query().withGraphFetched("user(simpleWithImage)");
  }

  // Get time entries for task
  static async getByTask(taskId) {
    return KanbanTimeEntry.query()
      .where("task_id", taskId)
      .withGraphFetched("user(simpleWithImage)")
      .orderBy("logged_date", "desc");
  }

  // Get total hours for task
  static async getTotalHoursForTask(taskId) {
    const result = await KanbanTimeEntry.query()
      .where("task_id", taskId)
      .sum("hours as total_hours")
      .first();
    return parseFloat(result?.total_hours) || 0;
  }

  // Get time entries by user
  static async getByUser(userId, { startDate, endDate } = {}) {
    let query = KanbanTimeEntry.query()
      .where("user_id", userId)
      .withGraphFetched("[task(simpleSelect)]")
      .orderBy("logged_date", "desc");

    if (startDate) {
      query = query.where("logged_date", ">=", startDate);
    }
    if (endDate) {
      query = query.where("logged_date", "<=", endDate);
    }

    return query;
  }

  // Get time summary for project
  static async getProjectTimeSummary(projectId, { startDate, endDate } = {}) {
    let query = KanbanTimeEntry.query()
      .join("kanban.tasks", "kanban.time_entries.task_id", "kanban.tasks.id")
      .where("kanban.tasks.project_id", projectId)
      .select(
        KanbanTimeEntry.raw("SUM(kanban.time_entries.hours) as total_hours"),
        KanbanTimeEntry.raw("COUNT(DISTINCT kanban.time_entries.task_id) as tasks_with_time"),
        KanbanTimeEntry.raw("COUNT(DISTINCT kanban.time_entries.user_id) as users_logged")
      )
      .first();

    if (startDate) {
      query = query.where("kanban.time_entries.logged_date", ">=", startDate);
    }
    if (endDate) {
      query = query.where("kanban.time_entries.logged_date", "<=", endDate);
    }

    return query;
  }

  // Get time by member for project
  static async getTimeByMember(projectId, { startDate, endDate } = {}) {
    let query = KanbanTimeEntry.query()
      .join("kanban.tasks", "kanban.time_entries.task_id", "kanban.tasks.id")
      .join("users", "kanban.time_entries.user_id", "users.custom_id")
      .where("kanban.tasks.project_id", projectId)
      .select(
        "users.custom_id as user_id",
        "users.username",
        "users.image"
      )
      .sum("kanban.time_entries.hours as total_hours")
      .count("* as entry_count")
      .groupBy("users.custom_id", "users.username", "users.image")
      .orderBy("total_hours", "desc");

    if (startDate) {
      query = query.where("kanban.time_entries.logged_date", ">=", startDate);
    }
    if (endDate) {
      query = query.where("kanban.time_entries.logged_date", "<=", endDate);
    }

    return query;
  }

  // Get daily time entries for project (for chart)
  static async getDailyTimeForProject(projectId, { startDate, endDate } = {}) {
    let query = KanbanTimeEntry.query()
      .join("kanban.tasks", "kanban.time_entries.task_id", "kanban.tasks.id")
      .where("kanban.tasks.project_id", projectId)
      .select("kanban.time_entries.logged_date as date")
      .sum("kanban.time_entries.hours as total_hours")
      .groupBy("kanban.time_entries.logged_date")
      .orderBy("kanban.time_entries.logged_date", "asc");

    if (startDate) {
      query = query.where("kanban.time_entries.logged_date", ">=", startDate);
    }
    if (endDate) {
      query = query.where("kanban.time_entries.logged_date", "<=", endDate);
    }

    return query;
  }
}

module.exports = KanbanTimeEntry;

