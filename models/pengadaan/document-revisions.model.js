const { Model } = require("objection");
const knex = require("../../db");

Model.knex(knex);

class DocumentRevisions extends Model {
  static get tableName() {
    return "pengadaan.document_revisions";
  }

  static get relationMappings() {
    const User = require("@/models/users.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "pengadaan.document_revisions.user_id",
          to: "users.custom_id",
        },
      },
      admin: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "pengadaan.document_revisions.processed_by",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = DocumentRevisions;
