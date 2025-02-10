const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Contacts extends Model {
  static get tableName() {
    return "rasn_mail.contacts";
  }
}

module.exports = Contacts;
