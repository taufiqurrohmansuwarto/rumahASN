const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class UsersHistories extends Model {
  static get tableName() {
    return "id";
  }
}

export default UsersHistories;
