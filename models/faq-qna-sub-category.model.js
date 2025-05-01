const { Model } = require("objection");
const knex = require("../db");
// nanoid

Model.knex(knex);

class FaqQnaSubCategory extends Model {
  static get tableName() {
    return "faq_sub_category";
  }

  static get idColumn() {
    return ["faq_qna_id", "sub_category_id"];
  }

  static get relationMappings() {
    const FaqQna = require("@/models/faq-qna.model");

    return {
      faq_qna: {
        relation: Model.HasOneRelation,
        modelClass: FaqQna,
        join: {
          from: "faq_sub_category.faq_qna_id",
          to: "faq_qna.id",
        },
      },
    };
  }
}

module.exports = FaqQnaSubCategory;
