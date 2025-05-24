const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class BroadcastGroup extends Model {
  $beforeInsert() {
    this.id = this.id || nanoid(25);
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get tableName() {
    return "rasn_mail.broadcast_groups";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const BroadcastMember = require("@/models/rasn_mail/broadcast-members.model");

    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_mail.broadcast_groups.created_by",
          to: "public.users.custom_id",
        },
      },
      members: {
        relation: Model.HasManyRelation,
        modelClass: BroadcastMember,
        join: {
          from: "rasn_mail.broadcast_groups.id",
          to: "rasn_mail.broadcast_members.group_id",
        },
      },
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: "rasn_mail.broadcast_groups.id",
          through: {
            from: "rasn_mail.broadcast_members.group_id",
            to: "rasn_mail.broadcast_members.user_id",
          },
          to: "public.users.custom_id",
        },
      },
    };
  }

  // Method untuk get actual recipients based on group type
  async getRecipients() {
    const User = require("@/models/users.model");

    switch (this.type) {
      case "all_users":
        return User.query().select(
          "custom_id",
          "username",
          "email",
          "organization_id"
        );

      case "by_organization":
        const { organization_id } = this.criteria || {};
        return User.query()
          .select("custom_id", "username", "email", "organization_id")
          .where("organization_id", organization_id);

      case "by_role":
        const { role } = this.criteria || {};
        return User.query()
          .select("custom_id", "username", "email", "organization_id")
          .where("current_role", role);

      case "custom":
        return User.query()
          .select("custom_id", "username", "email", "organization_id")
          .whereIn(
            "custom_id",
            BroadcastMember.query().select("user_id").where("group_id", this.id)
          );

      default:
        return [];
    }
  }

  // Virtual property untuk member count
  static get virtualAttributes() {
    return ["member_count"];
  }

  async member_count() {
    if (this.type === "custom") {
      return this.members ? this.members.length : 0;
    } else {
      // For auto groups, count all matching users
      const recipients = await this.getRecipients();
      return recipients.length;
    }
  }
}

module.exports = BroadcastGroup;
