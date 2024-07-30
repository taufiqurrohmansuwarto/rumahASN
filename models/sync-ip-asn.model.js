const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class SyncIpAsn extends Model {
  static get idColumn() {
    return "id";
  }

  static get tableName() {
    return "sync_ip_asn";
  }

  static get relationMappings() {}
}

module.exports = SyncIpAsn;
