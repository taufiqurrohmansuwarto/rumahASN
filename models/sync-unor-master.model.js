const { Model, raw } = require("objection");
const knex = require("../db");

Model.knex(knex);

class SyncUnorMaster extends Model {
  static get idColumn() {
    return "id";
  }

  static get tableName() {
    return "sync_unor_master";
  }

  static async getRelationCountsPerId(idFilter) {
    const query = this.query()
      .select(
        "sync_unor_master.id as id",
        "sync_unor_master.pId as parentId",
        "sync_unor_master.name as name",
        "sync_unor_master.id as value",
        "sync_unor_master.name as label",
        "sync_unor_master.name as title",
        // concat label with related_count
        raw(
          "CONCAT(sync_unor_master.name, ' (', COUNT(unor.id), ') - ', sync_unor_master.id) as title"
        )
      )
      .leftJoin("rekon.unor", "sync_unor_master.id", "unor.id_simaster")
      .groupBy("sync_unor_master.id");

    if (idFilter) {
      query.where("sync_unor_master.id", "ilike", `${idFilter}%`);
    }

    return query;
  }

  static async getProgress(idFilter = null) {
    const query = this.query()
      .leftJoin("rekon.unor", "sync_unor_master.id", "rekon.unor.id_simaster")
      .select(
        this.raw(`
          COUNT(sync_unor_master.id) AS total_unor,
          COUNT(DISTINCT rekon.unor.id_simaster) AS total_yang_sudah,
          COUNT(sync_unor_master.id) - COUNT(DISTINCT rekon.unor.id_simaster) AS total_yang_belum,
          ROUND(
            COUNT(DISTINCT rekon.unor.id_simaster)::DECIMAL / COUNT(sync_unor_master.id) * 100,
            2
          ) AS presentase_progress
        `)
      );

    // Tambahkan filter jika parameter idFilter diberikan
    if (idFilter) {
      query.where("sync_unor_master.id", "ILIKE", `${idFilter}%`);
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
        get_hierarchy_siasn(COALESCE(r.id_siasn, '')) AS unor_siasn,
        0 AS level
      FROM sync_unor_master AS sm
      LEFT JOIN rekon.unor AS r ON sm.id = r.id_simaster
      WHERE sm."pId" = '0' -- Root node

      UNION ALL

      SELECT
        sm.id AS id_simaster,
        sm."pId" AS parent_id,
        sm.name AS name,
        COALESCE(r.id_siasn, '') AS id_siasn,
        get_hierarchy_siasn(COALESCE(r.id_siasn, '')) AS unor_siasn,
        t.level + 1 AS level
      FROM sync_unor_master AS sm
      LEFT JOIN rekon.unor AS r ON sm.id = r.id_simaster
      INNER JOIN tree AS t ON sm."pId" = t.id_simaster
    )
    SELECT
      id_simaster,
      name,
      id_siasn,
      unor_siasn,
      level
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
    const rekonUnor = require("@/models/rekon/unor.model");
    return {
      rekon_unor: {
        relation: Model.HasManyRelation,
        modelClass: rekonUnor,
        join: {
          from: "sync_unor_master.id",
          through: {
            from: "rekon.unor.simaster_id",
            to: "sync_unor_master.id",
          },
          to: "rekon.unor.simaster_id",
        },
      },
    };
  }
}

module.exports = SyncUnorMaster;
