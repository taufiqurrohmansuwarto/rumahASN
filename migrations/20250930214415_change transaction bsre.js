/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`
      -- Drop foreign key constraint lama
      ALTER TABLE esign.log_bsre_integration 
      DROP CONSTRAINT IF EXISTS log_bsre_integration_transaction_id_foreign;
      
      -- Buat kolom transaction_id nullable (jika belum)
      ALTER TABLE esign.log_bsre_integration
      ALTER COLUMN transaction_id DROP NOT NULL;
      
      -- Tambah constraint baru dengan ON DELETE SET NULL
      ALTER TABLE esign.log_bsre_integration
      ADD CONSTRAINT log_bsre_integration_transaction_id_foreign
      FOREIGN KEY (transaction_id) 
      REFERENCES esign.bsre_transactions(id)
      ON DELETE SET NULL 
      ON UPDATE CASCADE;
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
