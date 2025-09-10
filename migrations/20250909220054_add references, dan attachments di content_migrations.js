/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("content_versions", (table) => {
      table.jsonb("references").nullable();
      table.jsonb("attachments").nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("content_versions", (table) => {
      table.dropColumn("references");
      table.dropColumn("attachments");
    });
};
