/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`CREATE OR REPLACE FUNCTION get_hierarchy_simaster(id_input VARCHAR)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    WITH RECURSIVE unor_hierarchy AS (
        -- Langkah awal: Mulai dari "id" tertentu
        SELECT
            id,
            name,
            "pId",
            1 AS level  -- Level awal adalah 1
        FROM
            sync_unor_master
        WHERE
            id = id_input  -- Input parameter

        UNION ALL

        -- Langkah rekursif: Dapatkan data di atasnya
        SELECT
            r.id,
            r.name,
            r."pId",
            uh.level + 1 AS level  -- Tambahkan level setiap naik hierarki
        FROM
            sync_unor_master r
        INNER JOIN
            unor_hierarchy uh
        ON
            r.id = uh."pId"
    )
    -- Ambil semua data hierarki
    SELECT
        STRING_AGG(name, ' - ' ORDER BY level ASC)
    INTO result
    FROM
        unor_hierarchy;

    RETURN result;
END;
$$ LANGUAGE plpgsql;
`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
