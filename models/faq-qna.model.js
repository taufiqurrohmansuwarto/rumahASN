const { Model } = require("objection");
const knex = require("../db");
// nanoid

Model.knex(knex);

class FaqQna extends Model {
  static get tableName() {
    return "faq_qna";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    const SubCategory = require("@/models/sub-categories.model");
    return {
      sub_categories: {
        relation: Model.ManyToManyRelation,
        modelClass: SubCategory,
        join: {
          from: "faq_qna.id",
          through: {
            from: "faq_sub_category.faq_qna_id",
            to: "faq_sub_category.sub_category_id",
          },
          to: "sub_categories.id",
        },
      },
    };
  }
}

module.exports = FaqQna;
