/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("tickets", function (table) {
    table.jsonb("assignee_json");
    table.jsonb("requester_json");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("tickets", function (table) {
    table.dropColumn("assignee_json");
    table.dropColumn("requester_json");
  });
};
