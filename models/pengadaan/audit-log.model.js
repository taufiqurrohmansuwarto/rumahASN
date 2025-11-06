const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class AuditLog extends Model {
  static get tableName() {
    return "pengadaan.audit_log";
  }
}

module.exports = AuditLog;
