const { Model } = require("objection");
const { nanoid } = require("nanoid");
const knex = require("../db");

Model.knex(knex);

class Faqs extends Model {
  static get tableName() {
    return "laporan_netralitas";
  }

  static get idColumn() {
    return "id";
  }

  $beforeInsert() {
    this.id = nanoid(10);
    this.kode_laporan = `LAPNET-${nanoid(4)}`;
  }

  static get relationMappings() {
    const user = require("@/models/users.model");

    return {
      operator_netralitas: {
        relation: Model.BelongsToOneRelation,
        modelClass: user,
        join: {
          from: "laporan_netralitas.operator",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = Faqs;
