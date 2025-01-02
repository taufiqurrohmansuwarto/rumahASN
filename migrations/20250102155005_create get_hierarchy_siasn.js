/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`CREATE OR REPLACE FUNCTION get_hierarchy_siasn(id_input VARCHAR)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    WITH RECURSIVE unor_hierarchy AS (
        -- Langkah awal: Mulai dari "Id" tertentu
        SELECT
            "Id",
            "NamaUnor",
            "DiatasanId",
            1 AS level  -- Level awal adalah 1
        FROM
            ref_siasn_unor
        WHERE
            "Id" = id_input  -- Input parameter

        UNION ALL

        -- Langkah rekursif: Dapatkan data di atasnya
        SELECT
            r."Id",
            r."NamaUnor",
            r."DiatasanId",
            uh.level + 1 AS level  -- Tambahkan level setiap naik hierarki
        FROM
            ref_siasn_unor r
        INNER JOIN
            unor_hierarchy uh
        ON
            r."Id" = uh."DiatasanId"
    )
    -- Ambil semua data hierarki
    SELECT
        STRING_AGG("NamaUnor", ' - ' ORDER BY level ASC)
    INTO result
    FROM
        unor_hierarchy;

    RETURN result;
END;
$$ LANGUAGE plpgsql;`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
