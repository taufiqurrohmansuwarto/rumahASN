/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("options", (table) => {
    table.increments("id");
    table.string("option").notNullable();
    table.integer("poll_id").unsigned().notNullable();
    table.foreign("poll_id").references("polls.id").onDelete("CASCADE");
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
  return knex.schema.dropTable("options");
};
