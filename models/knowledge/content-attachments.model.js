const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class knowledgeContentAttachments extends Model {
  static get tableName() {
    return "knowledge.content_attachments";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {}
}

module.exports = knowledgeContentAttachments;
