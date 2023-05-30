/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("votes_pollings", (table) => {
    table.string("user_id");
    table.foreign("user_id").references("users.custom_id").onDelete("CASCADE");
    table.integer("option_id").unsigned().notNullable();
    table.foreign("option_id").references("options.id").onDelete("CASCADE");
    table.primary(["option_id", "user_id"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("votes_pollings");
};
