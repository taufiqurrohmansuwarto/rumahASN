const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class Pergub extends Model {
  static get tableName() {
    return "rasn_naskah.pergub";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const PergubRules = require("@/models/rasn-naskah/pergub-rules.model");

    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "rasn_naskah.pergub.created_by",
          to: "users.custom_id",
        },
      },
      rules: {
        relation: Model.HasManyRelation,
        modelClass: PergubRules,
        join: {
          from: "rasn_naskah.pergub.id",
          to: "rasn_naskah.pergub_rules.pergub_id",
        },
      },
    };
  }

  static get modifiers() {
    return {
      active(query) {
        query.where("is_active", true);
      },
      withRulesCount(query) {
        query.select(
          "rasn_naskah.pergub.*",
          Pergub.relatedQuery("rules").count().as("rules_count")
        );
      },
    };
  }
}

module.exports = Pergub;

