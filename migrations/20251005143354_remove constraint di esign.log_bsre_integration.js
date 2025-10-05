/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
  ALTER TABLE esign.log_bsre_integration
  DROP CONSTRAINT IF EXISTS log_bsre_integration_transaction_id_foreign;
 `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
