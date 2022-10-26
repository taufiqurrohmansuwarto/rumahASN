const { Model } = require("objection");
const knex = require("../db");
const { v4: uuidv4 } = require("uuid");

Model.knex(knex);

class TicketsCommentsAgents extends Model {
  $beforeInsert() {
    this.id = uuidv4();
  }

  static get tableName() {
    return "tickets_comments_agents";
  }

  static get relationMappings() {
    const user = require("./users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: user,
        join: {
          from: "tickets_comments_agents.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = TicketsCommentsAgents;
