/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("notifications", (table) => {
    table.increments("id").primary();
    table.string("type").notNullable();
    table.string("title").notNullable();
    table.string("content").notNullable();
    table.string("from").notNullable().references("users.custom_id");
    table.string("to").references("users.custom_id");
    table.timestamp("read_at");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("notifications");
};
