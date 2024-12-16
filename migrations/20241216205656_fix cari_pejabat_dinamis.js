/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
	CREATE OR REPLACE FUNCTION cari_pejabat_dinamis(skpd_input TEXT, nama_input TEXT)
RETURNS TABLE(
    nip_master TEXT,
    skpd_id TEXT,
    nama_master TEXT,
    similarity_score DOUBLE PRECISION,
    distance INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.nip_master::TEXT,
        sp.skpd_id::TEXT,
        sp.nama_master::TEXT,
        CAST(similarity(LOWER(TRIM(sp.nama_master)), LOWER(nama_input)) AS DOUBLE PRECISION) AS similarity_score,
        levenshtein(LOWER(TRIM(sp.nama_master)), LOWER(nama_input)) AS distance
    FROM sync_pegawai sp
    WHERE sp.skpd_id ILIKE skpd_input || '%' and (sp.jabatan_asn = 'JABATAN ADMINISTRATOR' or sp.jabatan_asn = 'JABATAN PIMPINAN TINGGI PRATAMA' or sp.jabatan_asn = 'PENGAWAS')
      AND (
           sp.nama_master ILIKE '%' || nama_input || '%'
        OR LOWER(TRIM(sp.nama_master)) % LOWER(nama_input)
        OR levenshtein(LOWER(TRIM(sp.nama_master)), LOWER(nama_input)) <= 10
        OR soundex(sp.nama_master) = soundex(nama_input)
      )
    ORDER BY similarity_score DESC,
             distance ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
	`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
