const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Recipients extends Model {
  static get tableName() {
    return "rasn_mail.recipients";
  }
}

module.exports = Recipients;
