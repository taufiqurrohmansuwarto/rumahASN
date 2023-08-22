const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Polls extends Model {
  static get tableName() {
    return "polls";
  }

  // realation with user
  static get relationMappings() {
    const author = require("@/models/users.model");

    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: author,
        join: {
          from: "polls.author",
          to: "users.custom_id",
        },
      },
    };
  }
}

export default Polls;
