const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KanbanTaskActivity extends Model {
  static get tableName() {
    return "kanban.task_activities";
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
          from: "kanban.task_activities.task_id",
          to: "kanban.tasks.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "kanban.task_activities.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  // Log activity helper
  static async log({ taskId, userId, action, oldValue = null, newValue = null, description = null }) {
    return KanbanTaskActivity.query().insert({
      task_id: taskId,
      user_id: userId,
      action,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      description,
    });
  }

  // Get activities for task
  static async getByTask(taskId, { page = 1, limit = 20 } = {}) {
    return KanbanTaskActivity.query()
      .where("task_id", taskId)
      .withGraphFetched("user(simpleWithImage)")
      .orderBy("created_at", "desc")
      .page(page - 1, limit);
  }

  // Get recent activities for project
  static async getByProject(projectId, { page = 1, limit = 50 } = {}) {
    return KanbanTaskActivity.query()
      .join("kanban.tasks", "kanban.task_activities.task_id", "kanban.tasks.id")
      .where("kanban.tasks.project_id", projectId)
      .select("kanban.task_activities.*")
      .withGraphFetched("[user(simpleWithImage), task(simpleSelect)]")
      .orderBy("kanban.task_activities.created_at", "desc")
      .page(page - 1, limit);
  }

  // Get activities for user
  static async getByUser(userId, { page = 1, limit = 50 } = {}) {
    return KanbanTaskActivity.query()
      .where("user_id", userId)
      .withGraphFetched("[task(simpleSelect)]")
      .orderBy("created_at", "desc")
      .page(page - 1, limit);
  }

  // Get activity summary for project (for reports)
  static async getProjectSummary(projectId, startDate = null, endDate = null) {
    let query = KanbanTaskActivity.query()
      .join("kanban.tasks", "kanban.task_activities.task_id", "kanban.tasks.id")
      .where("kanban.tasks.project_id", projectId)
      .select("action")
      .count("* as count")
      .groupBy("action");

    if (startDate) {
      query = query.where("kanban.task_activities.created_at", ">=", startDate);
    }
    if (endDate) {
      query = query.where("kanban.task_activities.created_at", "<=", endDate);
    }

    return query;
  }

  // Get member activity summary
  static async getMemberActivitySummary(projectId, startDate = null, endDate = null) {
    let query = KanbanTaskActivity.query()
      .join("kanban.tasks", "kanban.task_activities.task_id", "kanban.tasks.id")
      .join("users", "kanban.task_activities.user_id", "users.custom_id")
      .where("kanban.tasks.project_id", projectId)
      .select(
        "users.custom_id as user_id",
        "users.username",
        "users.image"
      )
      .count("* as activity_count")
      .groupBy("users.custom_id", "users.username", "users.image")
      .orderBy("activity_count", "desc");

    if (startDate) {
      query = query.where("kanban.task_activities.created_at", ">=", startDate);
    }
    if (endDate) {
      query = query.where("kanban.task_activities.created_at", "<=", endDate);
    }

    return query;
  }
}

module.exports = KanbanTaskActivity;

