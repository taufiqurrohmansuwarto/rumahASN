const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class Subfaqs extends Model {
  static get tableName() {
    return "sub_faqs";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    const user = require("./users.model");
    const faq = require("./faqs.model");

    return {
      created_by: {
        relation: Model.BelongsToOneRelation,
        modelClass: user,
        join: {
          from: "sub_faqs.user_id",
          to: "users.custom_id",
        },
      },
      faq: {
        relation: Model.BelongsToOneRelation,
        modelClass: faq,
        join: {
          from: "sub_faqs.faq_id",
          to: "faqs.id",
        },
      },
    };
  }
}

module.exports = Subfaqs;
