const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Notifications extends Model {
  static get tableName() {
    return "notifications";
  }

  //    relation with users table
  static get relationMappings() {
    const User = require("./users.model");
    return {
      from: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "notifications.from",
          to: "users.custom_id",
        },
      },
      to: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "notifications.to",
          to: "users.custom_id",
        },
      },
    };
  }
}

export default Notifications;
