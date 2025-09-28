const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class LogUserActivity extends Model {
  static get tableName() {
    return "esign.log_user_activity";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {}
}

module.exports = LogUserActivity;
