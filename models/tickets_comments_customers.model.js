const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class TickestCommentsCustomers extends Model {
  static get tableName() {
    return "tickets_comments_customers";
  }

  static get idcolumn() {
    return "id";
  }

  static get relationMappings() {
    const user = require("./users.model");
    const reactions = require("./comments-reactions.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: user,
        join: {
          from: "tickets_comments_customers.user_id",
          to: "users.custom_id",
        },
      },
      reactions: {
        relation: Model.HasManyRelation,
        modelClass: reactions,
        join: {
          from: "tickets_comments_customers.id",
          to: "comments_reactions.comment_id",
        },
      },
    };
  }
}

module.exports = TickestCommentsCustomers;
