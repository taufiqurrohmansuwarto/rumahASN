const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Notifications extends Model {
  static get tableName() {
    return "signify.notifications";
  }
}

module.exports = Notifications;
