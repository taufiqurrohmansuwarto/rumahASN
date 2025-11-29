/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.transaction(async (trx) => {
    await trx.raw(`
	-- Ubah tipe kolom lampiran_dokumen di konsultasi_hukum
ALTER TABLE sapa_asn.konsultasi_hukum 
  ALTER COLUMN lampiran_dokumen TYPE jsonb USING 
    CASE 
      WHEN lampiran_dokumen IS NULL THEN NULL
      WHEN lampiran_dokumen = '' THEN '[]'::jsonb
      ELSE lampiran_dokumen::jsonb
    END;

-- Ubah tipe kolom lampiran_dokumen di pendampingan
ALTER TABLE sapa_asn.pendampingan 
  ALTER COLUMN lampiran_dokumen TYPE jsonb USING 
    CASE 
      WHEN lampiran_dokumen IS NULL THEN NULL
      WHEN lampiran_dokumen = '' THEN '[]'::jsonb
      ELSE lampiran_dokumen::jsonb
    END;
  `);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
