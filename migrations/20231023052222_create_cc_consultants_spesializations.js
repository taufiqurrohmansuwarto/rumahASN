/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("cc_consultants_spesializations", (table) => {
    table.string("user_id");
    table.integer("spesialization_id");
    table.primary(["user_id", "spesialization_id"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("cc_consultants_spesializations");
};
