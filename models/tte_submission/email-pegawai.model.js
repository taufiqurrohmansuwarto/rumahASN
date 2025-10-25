const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class EmailPegawai extends Model {
  static get tableName() {
    return "tte_submission.email_pegawai";
  }
  static get relationMappings() {
    const User = require("@/models/sync-pegawai.model");
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "tte_submission.email_pegawai.nip",
          to: "sync_pegawai.nip_master",
        },
      },
    };
  }
}

module.exports = EmailPegawai;
