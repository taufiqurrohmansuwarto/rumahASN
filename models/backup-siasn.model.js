const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class BackupSIASN extends Model {
  static get tableName() {
    return "backup_siasn";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = BackupSIASN;
