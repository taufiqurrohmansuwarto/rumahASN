const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Emails extends Model {
  static get tableName() {
    return "rasn_mail.emails";
  }
}

module.exports = Emails;
