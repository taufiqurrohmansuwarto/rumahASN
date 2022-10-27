const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Notifications extends Model {
  static get tableName() {
    return "notifications";
  }

  static get idColumn() {
    return "id";
  }

  //    relation with users table
  static get relationMappings() {
    const User = require("./users.model");

    return {};
  }
}

module.exports = Notifications;
