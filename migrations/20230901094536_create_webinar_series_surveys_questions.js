/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    "webinar_series_surveys_questions",
    function (table) {
      table.string("id").primary();
      table.string("question");
      table.string("type");
      table.timestamps(true, true);
    }
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropSchemaIfExists("webinar_series_surveys_questions");
};
