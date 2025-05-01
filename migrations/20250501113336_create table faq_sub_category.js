/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("faq_sub_category", (table) => {
    table
      .integer("faq_qna_id")
      .references("id")
      .inTable("faq_qna")
      .onDelete("CASCADE");
    table
      .integer("sub_category_id")
      .references("id")
      .inTable("sub_categories")
      .onDelete("CASCADE");
    table.primary(["faq_qna_id", "sub_category_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("faq_sub_category");
};
