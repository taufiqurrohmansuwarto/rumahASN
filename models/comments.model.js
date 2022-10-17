const { Model } = require("objection");
const knex = require("../config/db");

Model.knex(knex);

class Comments extends Model {
  static get tableName() {
    return "comments";
  }
  static get relationMappings() {}
}

module.exports = Comments;
