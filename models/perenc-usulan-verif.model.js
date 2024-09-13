const { Model } = require("objection");
const knex = require("../db");
const User = require("@/models/users.model");
const { nanoid } = require("nanoid");
Model.knex(knex);

class PerencUsulanVerif extends Model {
  static get tableName() {
    return "perenc_usulan_verif";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  $beforeUpdate() {
    this.updated_at = new Date();
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perenc_usulan_verif.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = PerencUsulanVerif;
