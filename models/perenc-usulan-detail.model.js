const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class PerencUsulanDetail extends Model {
  static get tableName() {
    return "perenc_usulan_detail";
  }

  static get relationMappings() {
    const Unor = require("@/models/sync-unor-master.model");
    const Pendidikan = require("@/models/siasn-pend.model");
    const Pelaksana = require("@/models/simaster-jfu.model");
    const User = require("@/models/users.model");

    return {
      unor: {
        relation: Model.BelongsToOneRelation,
        modelClass: Unor,
        join: {
          from: "perenc_usulan_detail.simaster_skpd_id",
          to: "sync_unor_master.id",
        },
      },
      pendidikan: {
        relation: Model.BelongsToOneRelation,
        modelClass: Pendidikan,
        join: {
          from: "perenc_usulan_detail.siasn_pend_id",
          to: "siasn_pend.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "perenc_usulan_detail.user_id",
          to: "users.custom_id",
        },
      },
      pelaksana: {
        relation: Model.BelongsToOneRelation,
        modelClass: Pelaksana,
        join: {
          from: "perenc_usulan_detail.simaster_jfu_id",
          to: "simaster_jfu.id",
        },
      },
    };
  }
}

module.exports = PerencUsulanDetail;
