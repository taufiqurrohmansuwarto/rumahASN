/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("saved_replies", (table) => {
    table.renameColumn("title", "name");
    table.renameColumn("reply", "content");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("saved_replies", (table) => {
    table.renameColumn("name", "title");
    table.renameColumn("content", "reply");
  });
};
