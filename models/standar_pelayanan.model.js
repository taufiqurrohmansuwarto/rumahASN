const { Model } = require("objection");
const knex = require("../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class StandarPelayanan extends Model {
  static get tableName() {
    return "standar_pelayanan";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "standar_pelayanan.user_id",
          to: "users.custom-id",
        },
      },
    };
  }

  static get idColumn() {
    return "id";
  }

  $beforeInsert() {
    this.id = nanoid(8);
  }
}

module.exports = StandarPelayanan;
