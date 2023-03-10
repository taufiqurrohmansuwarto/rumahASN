/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("saved_replies", (table) => {
    table.increments("id");
    table.text("title");
    table.text("reply");
    table.string("user_id");
    table.foreign("user_id").references("users.custom_id");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("saved_replies");
};
