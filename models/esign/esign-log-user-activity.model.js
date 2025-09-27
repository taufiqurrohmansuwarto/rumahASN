const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class LogUserActivity extends Model {
  static get tableName() {
    return "esign.log_user_activity";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users/user.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "esign.log_user_activity.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = LogUserActivity;
