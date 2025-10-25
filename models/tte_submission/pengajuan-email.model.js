const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class PengajuanEmail extends Model {
  $beforeInsert() {
    this.id = this.id || nanoid(25);
  }

  static get tableName() {
    return "tte_submission.pengajuan_email";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "tte_submission.pengajuan_email.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = PengajuanEmail;
