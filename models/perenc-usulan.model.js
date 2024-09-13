const { Model } = require("objection");
const knex = require("../db");
const User = require("@/models/users.model");
Model.knex(knex);

class PerencUsulan extends Model {
  static get tableName() {
    return "perenc_usulan";
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
          from: "perenc_usulan.user_id",
          to: "users.custom_id",
        },
      },
    };
  }
}

module.exports = PerencUsulan;
