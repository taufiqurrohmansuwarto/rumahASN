const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KanbanProjectWatcher extends Model {
  static get tableName() {
    return "kanban.project_watchers";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const KanbanProject = require("@/models/kanban/projects.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "kanban.project_watchers.user_id",
          to: "users.custom_id",
        },
      },
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanProject,
        join: {
          from: "kanban.project_watchers.project_id",
          to: "kanban.projects.id",
        },
      },
    };
  }

  // Check if user is watcher of project
  static async isWatcher(projectId, userId) {
    const watcher = await KanbanProjectWatcher.query()
      .where("project_id", projectId)
      .where("user_id", userId)
      .first();
    return !!watcher;
  }

  // Check if watcher can comment
  static async canComment(projectId, userId) {
    const watcher = await KanbanProjectWatcher.query()
      .where("project_id", projectId)
      .where("user_id", userId)
      .first();
    return watcher?.can_comment || false;
  }

  // Check if watcher can view reports
  static async canViewReports(projectId, userId) {
    const watcher = await KanbanProjectWatcher.query()
      .where("project_id", projectId)
      .where("user_id", userId)
      .first();
    return watcher?.can_view_reports || false;
  }
}

module.exports = KanbanProjectWatcher;
