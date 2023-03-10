/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("mentions", (table) => {
    table.increments("id").primary();
    table.string("user_id");
    table.string("mention_by");
    table.uuid("ticket_id");
    table.foreign("ticket_id").references("tickets.id");
    table.foreign("mention_by").references("users.custom_id");
    table.foreign("user_id").references("users.custom_id");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("mentions");
};
