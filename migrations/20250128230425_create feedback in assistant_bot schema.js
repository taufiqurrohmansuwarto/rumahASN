/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("assistant_bot")
    .createTable("feedbacks", (table) => {
      table.increments("id").primary();
      table.string("assistant_bot_id");
      table.string("user_id");
      table.text("feedback");
      table.integer("rating");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("assistant_bot").dropTable("feedbacks");
};
