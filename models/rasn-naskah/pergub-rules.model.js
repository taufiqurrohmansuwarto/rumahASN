const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class PergubRules extends Model {
  static get tableName() {
    return "rasn_naskah.pergub_rules";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const Pergub = require("@/models/rasn-naskah/pergub.model");

    return {
      pergub: {
        relation: Model.BelongsToOneRelation,
        modelClass: Pergub,
        join: {
          from: "rasn_naskah.pergub_rules.pergub_id",
          to: "rasn_naskah.pergub.id",
        },
      },
    };
  }

  static get modifiers() {
    return {
      active(query) {
        query.where("is_active", true);
      },
      byType(query, ruleType) {
        query.where("rule_type", ruleType);
      },
      withQdrant(query) {
        query.whereNotNull("qdrant_point_id");
      },
      orderByPriority(query) {
        query.orderBy("priority", "desc");
      },
    };
  }
}

module.exports = PergubRules;

