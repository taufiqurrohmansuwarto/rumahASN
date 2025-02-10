const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class EmailLabels extends Model {
  static get tableName() {
    return "rasn_mail.email_labels";
  }
}

module.exports = EmailLabels;
