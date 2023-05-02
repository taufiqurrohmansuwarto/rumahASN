const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class PrivateMessages extends Model {
  static get tableName() {
    return "private_messages";
  }

  // realation with user
  static get relationMappings() {
    const Users = require("./users.model");

    return {
      sender: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: "private_messages.sender_id",
          to: "users.custom_id",
        },
      },
      receiver: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: "private_messages.receiver_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = PrivateMessages;
