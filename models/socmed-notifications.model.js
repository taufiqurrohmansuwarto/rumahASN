const { Model } = require("objection");
const { nanoid } = require("nanoid");

const knex = require("../db");
Model.knex(knex);

class SocmedNotifications extends Model {
  static get tableName() {
    return "socmed_notifications";
  }

  static get relationMappings() {
    const User = require("./users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "socmed_notifications.user_id",
          to: "users.custom_id",
        },
      },
      trigger_user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "socmed_notifications.trigger_user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  $beforeInsert() {
    this.id = nanoid(8);
  }
}

module.exports = SocmedNotifications;
