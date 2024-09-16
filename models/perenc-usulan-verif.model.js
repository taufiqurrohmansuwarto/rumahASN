const { Model } = require("objection");
const knex = require("../db");
const User = require("@/models/users.model");
const { nanoid } = require("nanoid");
Model.knex(knex);
const PerencUsulanDetail = require("@/models/perenc-usulan-detail.model");

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
      perenc_detail: {
        relation: Model.HasManyRelation,
        modelClass: PerencUsulanDetail,
        join: {
          from: "perenc_usulan_verif.id",
          to: "perenc_usulan_detail.perencanaan_verif_id",
        },
      },
    };
  }
}

module.exports = PerencUsulanVerif;
