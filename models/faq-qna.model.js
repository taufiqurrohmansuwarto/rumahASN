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

  static $beforeUpdate() {
    this.updated_at = new Date();
  }

  // Get active at specific date
  static getActive(referenceDate = new Date()) {
    return this.query()
      .where("is_active", true)
      .where("effective_date", "<=", referenceDate)
      .where(function () {
        this.whereNull("expired_date").orWhere(
          "expired_date",
          ">",
          referenceDate
        );
      });
  }

  // Full-text search (if search_vector exists)
  static async fullTextSearch(query, subCategoryId = null, limit = 5) {
    let qb = this.query()
      .select(
        "faq_qna.*",
        this.raw(
          `ts_rank(search_vector, plainto_tsquery('indonesian', ?)) as rank`,
          [query]
        )
      )
      .whereRaw(`search_vector @@ plainto_tsquery('indonesian', ?)`, [query])
      .where("is_active", true)
      .orderBy("rank", "desc")
      .limit(limit);

    if (subCategoryId) {
      qb = qb.where("sub_category_id", subCategoryId);
    }

    return qb;
  }

  static get relationMappings() {
    const SubCategory = require("@/models/sub-categories.model");
    return {
      previous_version: {
        relation: Model.BelongsToOneRelation,
        modelClass: FaqQna,
        join: {
          from: "faq_qna.previous_version_id",
          to: "faq_qna.id",
        },
      },
      next_version: {
        relation: Model.HasManyRelation,
        modelClass: FaqQna,
        join: {
          from: "faq_qna.id",
          to: "faq_qna.previous_version_id",
        },
      },
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
