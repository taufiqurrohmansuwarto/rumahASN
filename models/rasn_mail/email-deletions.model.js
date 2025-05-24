const { Model } = require("objection");
const knex = require("../../db");
const nanoid = require("nanoid");

Model.knex(knex);

class EmailDeletion extends Model {
  $beforeInsert() {
    this.id = this.id || nanoid(25);
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get tableName() {
    return "rasn_mail.email_deletions";
  }

  static get relationMappings() {
    const Email = require("@/models/rasn_mail/emails.model");
    const User = require("@/models/users.model");

    return {
      email: {
        relation: Model.BelongsToOneRelation,
        modelClass: Email,
        join: {
          from: "rasn_mail.email_deletions.email_id",
          to: "rasn_mail.emails.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_mail.email_deletions.user_id",
          to: "public.users.custom_id",
        },
      },
    };
  }
}

module.exports = EmailDeletion;
