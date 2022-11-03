/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // add column to tickets table
  return knex.raw(
    `alter table tickets
    add column sub_category_id int references sub_categories (id);
`
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(
    `alter table tickets
		drop column sub_category_id;`
  );
};
