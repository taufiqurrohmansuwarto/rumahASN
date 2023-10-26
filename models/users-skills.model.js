const { v4: uuidv4 } = require("uuid");
const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class UsersSkills extends Model {
  static get tableName() {
    return "users_skils";
  }
}

module.exports = UsersSkills;
