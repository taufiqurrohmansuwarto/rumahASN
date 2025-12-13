const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class WorkspaceMember extends Model {
  static get tableName() {
    return "rasn_chat.workspace_members";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const WorkspaceRole = require("@/models/rasn_chat/workspace-roles.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_chat.workspace_members.user_id",
          to: "users.custom_id",
        },
      },
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: WorkspaceRole,
        join: {
          from: "rasn_chat.workspace_members.role_id",
          to: "rasn_chat.workspace_roles.id",
        },
      },
    };
  }

  // Get user's workspace membership with role
  static async getByUserId(userId) {
    return WorkspaceMember.query()
      .where("user_id", userId)
      .where("is_active", true)
      .withGraphFetched("role")
      .first();
  }

  // Add user to workspace with default role
  static async addMember(userId, roleId = null) {
    const WorkspaceRole = require("@/models/rasn_chat/workspace-roles.model");

    // Get default role if not specified
    if (!roleId) {
      const defaultRole = await WorkspaceRole.getDefaultRole();
      roleId = defaultRole?.id || "ws-role-member";
    }

    return WorkspaceMember.query()
      .insert({
        user_id: userId,
        role_id: roleId,
        is_active: true,
      })
      .onConflict("user_id")
      .merge();
  }

  // Update member role
  static async updateRole(userId, roleId) {
    return WorkspaceMember.query()
      .patch({ role_id: roleId })
      .where("user_id", userId);
  }

  // Check if user is superadmin
  static async isSuperadmin(userId) {
    const member = await WorkspaceMember.query()
      .where("user_id", userId)
      .where("is_active", true)
      .withGraphFetched("role")
      .first();

    return member?.role?.name === "superadmin";
  }

  // Get all members
  static async getAllMembers({ page = 1, limit = 20, search = "" } = {}) {
    let query = WorkspaceMember.query()
      .where("is_active", true)
      .withGraphFetched("[user(simpleWithImage), role]")
      .orderBy("joined_at", "desc");

    if (search) {
      query = query
        .joinRelated("user")
        .where("user.username", "ilike", `%${search}%`);
    }

    return query.page(page - 1, limit);
  }
}

module.exports = WorkspaceMember;

