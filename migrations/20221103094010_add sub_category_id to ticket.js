/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.table("tickets", (table) => {
    table.string("sub_category_id").references("sub_categories.id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.table("tickets", (table) => {
    table.dropColumn("sub_category_id");
  });
};
