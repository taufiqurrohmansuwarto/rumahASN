const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Faqs extends Model {
  static get tableName() {
    return "faqs";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    const user = require("../models/users.model");
    const subFaqs = require("../models/sub-faqs.model");

    return {
      created_by: {
        relation: Model.BelongsToOneRelation,
        modelClass: user,
        join: {
          from: "faqs.user_id",
          to: "users.custom_id",
        },
      },
      sub_faq: {
        relation: Model.HasManyRelation,
        modelClass: subFaqs,
        join: {
          from: "faqs.id",
          to: "sub_faqs.faq_id",
        },
      },
    };
  }
}

module.exports = Faqs;
