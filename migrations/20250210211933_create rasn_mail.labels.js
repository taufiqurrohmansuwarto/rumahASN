/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("rasn_mail").createTable("labels", (table) => {
    table.string("id").primary();
    table
      .string("user_id")
      .references("custom_id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("name");
    table.boolean("is_system");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("rasn_mail").dropTable("labels");
};
