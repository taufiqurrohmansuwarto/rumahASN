const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class WorkspaceRole extends Model {
  static get tableName() {
    return "rasn_chat.workspace_roles";
  }

  static get relationMappings() {
    const WorkspaceMember = require("@/models/rasn_chat/workspace-members.model");

    return {
      members: {
        relation: Model.HasManyRelation,
        modelClass: WorkspaceMember,
        join: {
          from: "rasn_chat.workspace_roles.id",
          to: "rasn_chat.workspace_members.role_id",
        },
      },
    };
  }

  // Get all roles
  static async getAllRoles() {
    return WorkspaceRole.query().orderBy("is_default", "desc");
  }

  // Get default role for new members
  static async getDefaultRole() {
    return WorkspaceRole.query().where("is_default", true).first();
  }

  // Check if user has permission
  hasPermission(permission) {
    if (!this.permissions) return false;
    const perms =
      typeof this.permissions === "string"
        ? JSON.parse(this.permissions)
        : this.permissions;
    return perms.all === true || perms[permission] === true;
  }
}

module.exports = WorkspaceRole;

