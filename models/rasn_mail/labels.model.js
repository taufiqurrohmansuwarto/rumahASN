const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Labels extends Model {
  static get tableName() {
    return "rasn_mail.labels";
  }
}

module.exports = Labels;
