/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("submissions_pics", function (table) {
    table.renameColumn("submissions_id", "submission_reference_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("submissions_pics", function (table) {
    table.renameColumn("submission_reference_id", "submissions_id");
  });
};
