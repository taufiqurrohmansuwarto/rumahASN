const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KanbanProjectMember extends Model {
  static get tableName() {
    return "kanban.project_members";
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
          from: "kanban.project_members.user_id",
          to: "users.custom_id",
        },
      },
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanProject,
        join: {
          from: "kanban.project_members.project_id",
          to: "kanban.projects.id",
        },
      },
    };
  }

  // Check if user is member of project
  static async isMember(projectId, userId) {
    const member = await KanbanProjectMember.query()
      .where("project_id", projectId)
      .where("user_id", userId)
      .first();
    return !!member;
  }

  // Check if user is owner or admin
  static async isAdminOrOwner(projectId, userId) {
    const member = await KanbanProjectMember.query()
      .where("project_id", projectId)
      .where("user_id", userId)
      .whereIn("role", ["owner", "admin"])
      .first();
    return !!member;
  }

  // Get user role in project
  static async getUserRole(projectId, userId) {
    const member = await KanbanProjectMember.query()
      .where("project_id", projectId)
      .where("user_id", userId)
      .first();
    return member?.role || null;
  }
}

module.exports = KanbanProjectMember;

