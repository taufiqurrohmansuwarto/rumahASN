const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class knowledgeUserBadges extends Model {
  static get tableName() {
    return "knowledge.user_badges";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const Badges = require("./badges.model");
    
    return {
      badge: {
        relation: Model.BelongsToOneRelation,
        modelClass: Badges,
        join: {
          from: "knowledge.user_badges.badge_id",
          to: "knowledge.badges.id",
        },
      },
    };
  }
}

module.exports = knowledgeUserBadges;
