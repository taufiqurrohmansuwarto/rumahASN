/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("polls", (table) => {
    table.increments("id");
    table.boolean("is_public").defaultTo(true);
    table.string("question");
    table.timestamp("start_date");
    table.timestamp("end_date");
    table.string("author");
    table.foreign("author").references("users.custom_id").onDelete("CASCADE");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("polls");
};
