/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("podcasts", (table) => {
    // published_at
    table.timestamp("published_at");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("podcasts", (table) => {
    // published_at
    table.dropColumn("published_at");
  });
};
