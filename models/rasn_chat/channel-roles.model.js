const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class ChannelRole extends Model {
  static get tableName() {
    return "rasn_chat.channel_roles";
  }

  static get relationMappings() {
    const ChannelMember = require("@/models/rasn_chat/channel-members.model");

    return {
      members: {
        relation: Model.HasManyRelation,
        modelClass: ChannelMember,
        join: {
          from: "rasn_chat.channel_roles.id",
          to: "rasn_chat.channel_members.role_id",
        },
      },
    };
  }

  // Get all roles ordered by level
  static async getAllRoles() {
    return ChannelRole.query().orderBy("level", "desc");
  }

  // Get role by name
  static async getRoleByName(name) {
    return ChannelRole.query().where("name", name).first();
  }

  // Get member role (default for new members)
  static async getMemberRole() {
    return ChannelRole.query().where("name", "member").first();
  }

  // Get owner role
  static async getOwnerRole() {
    return ChannelRole.query().where("name", "owner").first();
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

  // Check if role level is higher than another
  isHigherThan(otherRole) {
    return this.level > (otherRole?.level || 0);
  }
}

module.exports = ChannelRole;

