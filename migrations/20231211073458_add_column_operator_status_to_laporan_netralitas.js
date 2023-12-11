/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("laporan_netralitas", (table) => {
    table.string("operator");
    table
      .foreign("operator")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("status");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("laporan_netralitas", (table) => {
    table.dropColumn("operator");
    table.dropColumn("status");
  });
};
