/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tickets_labels', (table) => {
    table.uuid('ticket_id').notNullable();
    table.string('label').notNullable();
    table.foreign('ticket_id').references('tickets.id')
    table.timestamps(true, true)
    table.primary(['ticket_id', 'label'])
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('tickets_labels')
};
