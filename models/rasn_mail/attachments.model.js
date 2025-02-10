const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class Attachments extends Model {
  static get tableName() {
    return "rasn_mail.attachments";
  }
}

module.exports = Attachments;
