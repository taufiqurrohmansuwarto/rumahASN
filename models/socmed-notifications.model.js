const { Model } = require("objection");
const { nanoid } = require("nanoid");

const knex = require("../db");
Model.knex(knex);

class SocmedNotifications extends Model {
  static get tableName() {
    return "socmed_notifications";
  }

  $beforeInsert() {
    this.id = nanoid(8);
  }
}

module.exports = SocmedNotifications;
