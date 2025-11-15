const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class ProxyPangkat extends Model {
  static get tableName() {
    return "siasn_proxy.proxy_pangkat";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = ProxyPangkat;

