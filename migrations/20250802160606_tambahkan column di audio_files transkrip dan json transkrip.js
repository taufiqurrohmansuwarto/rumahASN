/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema("verbatim_ai").table("audio_files", (table) => {
    table.text("transkrip");
    table.jsonb("json_transkrip");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("verbatim_ai").table("audio_files", (table) => {
    table.dropColumn("transkrip");
    table.dropColumn("json_transkrip");
  });
};
