/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("faq_qna", (table) => {
    table.increments("id").primary();
    table.text("question");
    table.text("answer");
    table.text("regulation_ref");
    table.integer("sub_category_id");
    table.boolean("is_active").defaultTo(true);
    table.dateTime("effective_date");
    table.dateTime("expired_date");
    table.string("created_by");
    table.string("updated_by");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("faq_qna");
};
