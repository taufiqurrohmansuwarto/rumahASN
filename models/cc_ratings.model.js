const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");
Model.knex(knex);

class CCRatings extends Model {
  static get tableName() {
    return "cc_ratings";
  }

  // realation with user
  static get relationMappings() {}
}

module.exports = CCRatings;
