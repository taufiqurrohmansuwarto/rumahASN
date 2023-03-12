/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('tickets', (table) => {
    table.renameColumn('is_public', 'is_published')
    table.renameColumn('is_pin', 'is_pinned')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('tickets', (table) => {
    table.renameColumn('is_published', 'is_public')
    table.renameColumn('is_pinned', 'is_pin')
  })
};
