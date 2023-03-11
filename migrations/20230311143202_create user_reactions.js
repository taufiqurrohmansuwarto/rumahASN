/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('users_reactions', table=> {
    table.increments('id').primary();
    table.string('user_id');
    table.foreign('user_id').references('users.custom_id');
    table.uuid('ticket_id');
    table.foreign('ticket_id').references('tickets.id');
    table.string('reaction');
    table.timestamps(true, true)
   })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users_reactions')
};
