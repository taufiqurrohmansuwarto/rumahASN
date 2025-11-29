/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.transaction(async (trx) => {
    await trx.raw(`
	-- =====================================================
-- SAPA ASN DATABASE ALTERATIONS
-- =====================================================

-- 1. ADVOKASI
-- -----------------------------------------------------
ALTER TABLE sapa_asn.advokasi 
  ALTER COLUMN kategori_isu TYPE jsonb USING 
    CASE 
      WHEN kategori_isu IS NULL THEN NULL
      WHEN kategori_isu = '' THEN '[]'::jsonb
      ELSE to_jsonb(string_to_array(kategori_isu, ','))
    END;

ALTER TABLE sapa_asn.advokasi ADD COLUMN IF NOT EXISTS kategori_lainnya varchar(255);

-- 2. KONSULTASI HUKUM
-- -----------------------------------------------------
ALTER TABLE sapa_asn.konsultasi_hukum 
  ALTER COLUMN jenis_permasalahan TYPE jsonb USING 
    CASE 
      WHEN jenis_permasalahan IS NULL THEN NULL
      WHEN jenis_permasalahan = '' THEN '[]'::jsonb
      ELSE to_jsonb(string_to_array(jenis_permasalahan, ','))
    END;

ALTER TABLE sapa_asn.konsultasi_hukum ADD COLUMN IF NOT EXISTS jenis_permasalahan_lainnya varchar(255);
ALTER TABLE sapa_asn.konsultasi_hukum ADD COLUMN IF NOT EXISTS is_persetujuan boolean default false;

-- 3. PENDAMPINGAN
-- -----------------------------------------------------
ALTER TABLE sapa_asn.pendampingan 
  ALTER COLUMN jenis_perkara TYPE jsonb USING 
    CASE 
      WHEN jenis_perkara IS NULL THEN NULL
      WHEN jenis_perkara = '' THEN '[]'::jsonb
      ELSE to_jsonb(string_to_array(jenis_perkara, ','))
    END;

ALTER TABLE sapa_asn.pendampingan 
  ALTER COLUMN bentuk_pendampingan TYPE jsonb USING 
    CASE 
      WHEN bentuk_pendampingan IS NULL THEN NULL
      WHEN bentuk_pendampingan = '' THEN '[]'::jsonb
      ELSE to_jsonb(string_to_array(bentuk_pendampingan, ','))
    END;

ALTER TABLE sapa_asn.pendampingan ADD COLUMN IF NOT EXISTS no_perkara varchar(255);
ALTER TABLE sapa_asn.pendampingan ADD COLUMN IF NOT EXISTS pengadilan_jadwal varchar(255);
ALTER TABLE sapa_asn.pendampingan ADD COLUMN IF NOT EXISTS jenis_perkara_lainnya varchar(255);
ALTER TABLE sapa_asn.pendampingan ADD COLUMN IF NOT EXISTS bentuk_pendampingan_lainnya varchar(255);
ALTER TABLE sapa_asn.pendampingan ADD COLUMN IF NOT EXISTS status varchar(255);
ALTER TABLE sapa_asn.pendampingan ADD COLUMN IF NOT EXISTS is_persetujuan boolean default false;

-- =====================================================
-- SELESAI
-- =====================================================`);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
