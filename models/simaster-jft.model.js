const { Model, raw } = require("objection");
const knex = require("../db");
Model.knex(knex);

class SimasterJft extends Model {
  static get tableName() {
    return "simaster_jft";
  }

  static get idColumn() {
    return "id";
  }

  static async getRelations() {
    const query = this.query()
      .select(
        "simaster_jft.id as id",
        "simaster_jft.pId as parentId",
        "simaster_jft.name as name",
        "simaster_jft.jenjang_jab as jenjang",
        "simaster_jft.gol_ruang as gol_ruang",
        "simaster_jft.id as value",
        raw(
          "CONCAT(simaster_jft.name, ' ', simaster_jft.jenjang_jab, ' - ', simaster_jft.gol_ruang) as label"
        ),
        // concat label with related_count
        raw(
          "CONCAT(simaster_jft.name, ' ', simaster_jft.jenjang_jab, ' - ', simaster_jft.gol_ruang, ' (', COUNT(jft.id), ')') as title"
        )
      )
      .leftJoin("rekon.jft", "simaster_jft.id", "jft.id_simaster")
      .groupBy(
        "simaster_jft.id",
        "simaster_jft.pId",
        "simaster_jft.name",
        "simaster_jft.jenjang_jab",
        "simaster_jft.gol_ruang"
      );

    return query;
  }

  static async getProgress(idFilter = null) {
    const query = this.query()
      .leftJoin("rekon.jft", "simaster_jft.id", "rekon.jft.id_simaster")
      .select(
        this.raw(`
          COUNT(simaster_jft.id) AS total_jft,
          COUNT(DISTINCT rekon.jft.id_simaster) AS total_yang_sudah,
          COUNT(simaster_jft.id) - COUNT(DISTINCT rekon.jft.id_simaster) AS total_yang_belum,
          ROUND(
            COUNT(DISTINCT rekon.jft.id_simaster)::DECIMAL / COUNT(simaster_jft.id) * 100,
            2
          ) AS presentase_progress
        `)
      );

    // Tambahkan filter jika parameter idFilter diberikan
    if (idFilter) {
      query.where("simaster_jft.id", "ILIKE", `${idFilter}%`);
    }

    return query.first(); // Hanya kembalikan satu hasi
  }

  static async getReport(idFilter = null) {
    const baseQuery = `
    WITH RECURSIVE tree AS (
      SELECT
        sm.id AS id_simaster,
        sm."pId" AS parent_id,
        sm.name AS name,
        COALESCE(r.id_siasn, '') AS id_siasn,
        get_hierarchy_siasn(COALESCE(r.id_siasn, '')) AS jft_siasn,
        COALESCE(rs.nama, '') AS nama_jft
      FROM simaster_jft AS sm
      LEFT JOIN rekon.jft AS r ON sm.id = r.id_simaster
      LEFT JOIN ref_siasn.jft AS rs ON rs.id = r.id_siasn
      WHERE sm."pId" = '0' -- Root node

      UNION ALL

      SELECT
        sm.id AS id_simaster,
        sm."pId" AS parent_id,
        sm.name AS name,
        COALESCE(r.id_siasn, '') AS id_siasn,
        get_hierarchy_siasn(COALESCE(r.id_siasn, '')) AS jft_siasn,
        COALESCE(rs.nama, '') AS nama_jft
      FROM simaster_jft AS sm
      LEFT JOIN rekon.jft AS r ON sm.id = r.id_simaster
      LEFT JOIN ref_siasn.jft AS rs ON rs.id = r.id_siasn
      INNER JOIN tree AS t ON sm."pId" = t.id_simaster
    )
    SELECT
      id_simaster,
      name,
      id_siasn,
      nama_jft
    FROM tree
  `;

    // Tambahkan filter jika `idFilter` diberikan
    const filterQuery = idFilter
      ? `${baseQuery} WHERE id_simaster ILIKE ? ORDER BY id_simaster`
      : `${baseQuery} ORDER BY id_simaster`;

    // Eksekusi query
    const result = await knex.raw(
      filterQuery,
      idFilter ? [`${idFilter}%`] : []
    );
    return result.rows || []; // Pastikan hasil berupa array
  }

  static get relationMappings() {
    const rekonJft = require("@/models/rekon/jft.model");
    return {
      rekon_jft: {
        relation: Model.HasManyRelation,
        modelClass: rekonJft,
        join: {
          from: "simaster_jft.id",
          through: {
            from: "rekon.jft.id_simaster",
            to: "simaster_jft.id",
          },
          to: "rekon.jft.id_simaster",
        },
      },
    };
  }
}

module.exports = SimasterJft;
