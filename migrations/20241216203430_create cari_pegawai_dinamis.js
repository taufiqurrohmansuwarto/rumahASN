/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname = 'public'
              AND tablename = 'sync_pegawai'
              AND indexname = 'idx_name_trgm'
        ) THEN
            CREATE INDEX idx_name_trgm ON sync_pegawai USING gin (nama_master gin_trgm_ops);
        END IF;
    END;
    $$;

    CREATE OR REPLACE FUNCTION cari_pegawai_dinamis(skpd_input TEXT, nama_input TEXT)
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
        WHERE sp.skpd_id ILIKE skpd_input || '%'
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
