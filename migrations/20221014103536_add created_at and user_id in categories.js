/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("categories", (table) => {
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.string("created_by").references("custom_id").inTable("users");
    table.string("updated_by").references("custom_id").inTable("users");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("categories", (table) => {
    table.dropColumn("created_at");
    table.dropColumn("user_id");
  });
};
