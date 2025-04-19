const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SiasnDownload extends Model {
  static get tableName() {
    return "siasn_download";
  }
}

module.exports = SiasnDownload;
