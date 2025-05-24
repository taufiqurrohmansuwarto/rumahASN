const { Model } = require("objection");
const knex = require("../../db");
const nanoid = require("nanoid");

Model.knex(knex);

class BroadcastMember extends Model {
  $beforeInsert() {
    this.id = this.id || nanoid(25);
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get tableName() {
    return "rasn_mail.broadcast_members";
  }

  static get relationMappings() {
    const BroadcastGroup = require("@/models/rasn_mail/broadcast-groups.model");
    const User = require("@/models/users.model");

    return {
      group: {
        relation: Model.BelongsToOneRelation,
        modelClass: BroadcastGroup,
        join: {
          from: "rasn_mail.broadcast_members.group_id",
          to: "rasn_mail.broadcast_groups.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_mail.broadcast_members.user_id",
          to: "public.users.custom_id",
        },
      },
    };
  }
}

module.exports = BroadcastMember;
