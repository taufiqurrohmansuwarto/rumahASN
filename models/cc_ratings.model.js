const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class CCRatings extends Model {
  static get tableName() {
    return "cc_ratings";
  }

  // realation with user
  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "cc_ratings.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = CCRatings;
