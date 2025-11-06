import { log } from "@/utils/logger";

const { handleError } = require("@/utils/helper/controller-helper");
const P3KParuhWaktu = require("@/models/pengadaan/p3k-paruh-waktu.model");

export const getPengadaanParuhWaktu = async (req, res) => {
  const knex = P3KParuhWaktu.knex();
  try {
    const { current_role, organization_id: skpd_id } = req?.user;
    const {
      limit = 10,
      page = 1,
      opd_id,
      nama = "",
      nip = "",
      no_peserta = "",
    } = req?.query;

    // Determine OPD ID based on user role
    // Admin can access all OPDs (starts with "1")
    // Non-admin can only access their own OPD and its children (e.g., 123 can access 123, 1231, 1232, etc.)
    const opdIdFilter = opd_id || (current_role === "admin" ? "1" : skpd_id);

    // Authorization check: non-admin users can only access their own OPD or its children
    if (current_role !== "admin") {
      if (!opdIdFilter.startsWith(skpd_id)) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden: You can only access your own OPD or its children",
        });
      }
    }

    // Build base query
    const baseQuery = P3KParuhWaktu.query()
      .select(
        "*",
        "unor_siasn_text as unor_siasn",
        "unor_simaster_text as unor_simaster"
      )
      .where((builder) => {
        builder.where("unor_id_simaster", "ILIKE", `${opdIdFilter}%`);
      })
      .where((builder) => {
        if (nama) {
          builder.where("nama", "ILIKE", `%${nama}%`);
        }
        if (nip) {
          builder.where("nip", "ILIKE", `%${nip}%`);
        }
        if (no_peserta) {
          builder.where("no_peserta", "ILIKE", `%${no_peserta}%`);
        }
      })
      .withGraphFetched("[detail, status_usulan]")
      .orderBy("nama", "asc");

    // Check if limit = -1 for downloading all data
    if (Number(limit) === -1) {
      const result = await baseQuery;
      return res.json({
        success: true,
        total: result.length,
        data: result,
      });
    }

    // Pagination mode
    const pageNum = Math.max(1, Number(page));
    const lim = Math.max(1, Math.min(100, Number(limit))); // Cap limit at 100

    const result = await baseQuery.page(pageNum - 1, lim);

    res.json({
      success: true,
      page: pageNum,
      limit: lim,
      total: result.total,
      data: result.results,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Sync/Upsert data pengadaan paruh waktu ke tabel p3k_paruh_waktu
 * Strategi: UPSERT (INSERT ... ON CONFLICT DO UPDATE)
 * - Insert jika record belum ada (gaji default 0)
 * - Update jika sudah ada (kecuali gaji, biar tetap sesuai yang sudah di-set)
 * Kolom: id (unique), usulan_id, nama, no_peserta, nip, unor_id_siasn, unor_id_simaster, gaji
 */
export const syncPengadaanParuhWaktu = async (req, res) => {
  const knex = P3KParuhWaktu.knex();

  try {
    // Query ringan - hanya ambil kolom yang diperlukan
    const dataToSync = await knex("siasn_pengadaan_proxy as sp")
      .where("sp.periode", "2025")
      .andWhere("sp.jenis_formasi_id", "0210") // Filter untuk PPPK Paruh Waktu
      .leftJoin(
        knex.raw(`(
          SELECT DISTINCT ON (id_siasn) id_siasn, id_simaster
          FROM rekon.unor
          ORDER BY id_siasn, id_simaster
        ) as ru`),
        knex.raw("sp.usulan_data->'data'->>'unor_id'"),
        "ru.id_siasn"
      )
      .select(
        "sp.id",
        "sp.nama",
        knex.raw("sp.usulan_data->'data'->>'no_peserta' as no_peserta"),
        knex.raw(
          "get_hierarchy_siasn(sp.usulan_data->'data'->>'unor_id') as unor_siasn_text"
        ),
        knex.raw(
          "CASE WHEN ru.id_simaster IS NOT NULL THEN get_hierarchy_simaster(ru.id_simaster) ELSE NULL END as unor_simaster_text"
        ),
        "sp.nip",
        "ru.id_siasn as unor_id_siasn",
        "ru.id_simaster as unor_id_simaster",
        "sp.status_usulan as usulan_id"
      );

    if (dataToSync.length === 0) {
      return res.json({
        success: true,
        message: "Tidak ada data untuk di-sync",
        data: {
          total: 0,
          inserted: 0,
          updated: 0,
        },
      });
    }

    // Transform ke format sederhana dengan gaji default 0
    const transformedData = dataToSync.map((row) => ({
      id: row?.id,
      unor_siasn_text: row?.unor_siasn_text,
      unor_simaster_text: row?.unor_simaster_text,
      usulan_id: row?.usulan_id,
      nama: row?.nama,
      no_peserta: row?.no_peserta,
      nip: row.nip,
      unor_id_siasn: row.unor_id_siasn,
      unor_id_simaster: row.unor_id_simaster,
      gaji: 0, // Default 0 untuk record baru
    }));

    // UPSERT: Insert jika baru, Update jika sudah ada (kecuali gaji)
    const result = await knex.raw(
      `
      INSERT INTO pengadaan.p3k_paruh_waktu (id, unor_siasn_text, unor_simaster_text, usulan_id, nama, no_peserta, nip, unor_id_siasn, unor_id_simaster, gaji)
      SELECT * FROM json_populate_recordset(NULL::record, ?::json) 
        AS t(id text, unor_siasn_text text, unor_simaster_text text, usulan_id text, nama text, no_peserta text, nip text, unor_id_siasn text, unor_id_simaster text, gaji bigint)
      ON CONFLICT (id) 
      DO UPDATE SET 
        unor_siasn_text = EXCLUDED.unor_siasn_text,
        unor_simaster_text = EXCLUDED.unor_simaster_text,
        usulan_id = EXCLUDED.usulan_id,
        nama = EXCLUDED.nama,
        no_peserta = EXCLUDED.no_peserta,
        nip = EXCLUDED.nip,
        unor_id_siasn = EXCLUDED.unor_id_siasn,
        unor_id_simaster = EXCLUDED.unor_id_simaster,
        updated_at = NOW()
        -- gaji tidak di-update, tetap menggunakan nilai yang sudah ada
    `,
      [JSON.stringify(transformedData)]
    );

    res.json({
      success: true,
      message: `Berhasil sync data pengadaan paruh waktu (UPSERT)`,
      data: {
        total: dataToSync.length,
        processed: result.rowCount || transformedData.length,
      },
    });
  } catch (error) {
    log.error("Error sync pengadaan paruh waktu:", error);
    res.status(500).json({
      success: false,
      message: "Error sync pengadaan paruh waktu",
      error: error?.message,
    });
  }
};

export const setGajiPengadaanParuhWaktu = async (req, res) => {
  try {
    const { id } = req?.query;
    const { gaji } = req?.body;
    const result = await P3KParuhWaktu.query().where("id", id).patch({ gaji });
    res.json({
      success: true,
      message: "Berhasil set gaji pengadaan paruh waktu",
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};
