const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Label extends Model {
  $beforeInsert() {
    this.id = this.id || nanoid(25);
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get tableName() {
    return "rasn_mail.labels";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const EmailLabel = require("@/models/rasn_mail/email-labels.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_mail.labels.user_id",
          to: "public.users.custom_id",
        },
      },
      emailLabels: {
        relation: Model.HasManyRelation,
        modelClass: EmailLabel,
        join: {
          from: "rasn_mail.labels.id",
          to: "rasn_mail.email_labels.label_id",
        },
      },
    };
  }

  // Static method untuk get user labels
  static async getUserLabels(userId) {
    return Label.query()
      .where((builder) => {
        builder.where("user_id", userId).orWhere("is_system", true);
      })
      .orderBy("is_system", "desc")
      .orderBy("sort_order");
  }

  // Static method untuk get system labels
  static async getSystemLabels() {
    return Label.query().where("is_system", true).orderBy("sort_order");
  }
}

module.exports = Label;
