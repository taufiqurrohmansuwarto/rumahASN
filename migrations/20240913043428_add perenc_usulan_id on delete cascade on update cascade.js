/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("perenc_usulan_detail", function (table) {
    table.dropForeign("perenc_usulan_id");
    table
      .foreign("perenc_usulan_id")
      .references("id")
      .inTable("perenc_usulan")
      .onDelete("cascade")
      .onUpdate("cascade");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("perenc_usulan_detail", function (table) {
    table.dropForeign("perenc_usulan_id");
  });
};
