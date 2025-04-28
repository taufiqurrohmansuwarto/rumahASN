/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
 return knex.schema.alterTable('sync_pegawai', function(table) {
  table.string('bup').nullable();
  table.string('tmt_pensiun').nullable();
  table.jsonb('skp').nullable();
 });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('sync_pegawai', function(table) {
    table.dropColumn('bup');
    table.dropColumn('tmt_pensiun');
    table.dropColumn('skp');
  });
};
