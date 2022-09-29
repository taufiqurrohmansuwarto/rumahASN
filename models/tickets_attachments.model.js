const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class TicketAttachments extends Model {
  static get tableName() {
    return "tickets_attachments";
  }
}

module.exports = TicketAttachments;
