/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable(
    "webinar_series_participates",
    function (table) {
      table.jsonb("user_information");
    }
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("webinar_series_participants", function (table) {
    table.dropColumn("user_information");
  });
};
