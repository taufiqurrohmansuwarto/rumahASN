const RiwayatAudit = require("@/models/perencanaan/perencanaan.riwayat_audit.model");
const Usulan = require("@/models/perencanaan/perencanaan.usulan.model");
const { handleError } = require("@/utils/helper/controller-helper");

// Helper function to get jabatan name by id and jenis
const getJabatanName = async (knex, jabatanId, jenisJabatan) => {
  if (!jabatanId) return null;

  if (jenisJabatan === "fungsional") {
    const result = await knex("simaster_jft")
      .select(
        knex.raw(
          "CONCAT(name, ' ', jenjang_jab, ' - ', gol_ruang) as nama_jabatan"
        )
      )
      .where("id", jabatanId)
      .first();
    return result?.nama_jabatan || jabatanId;
  } else if (jenisJabatan === "pelaksana") {
    const result = await knex("simaster_jfu")
      .select("name as nama_jabatan")
      .where("id", jabatanId)
      .first();
    return result?.nama_jabatan || jabatanId;
  }
  return jabatanId;
};

// Helper function to get unit kerja hierarchy
const getUnitKerjaHierarchy = async (knex, unitKerjaId) => {
  if (!unitKerjaId) return null;

  const result = await knex.raw(
    "SELECT get_hierarchy_simaster(?) as hierarchy",
    [unitKerjaId]
  );
  return result.rows?.[0]?.hierarchy || unitKerjaId;
};

/**
 * Get all riwayat audit
 */
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      formasi_id,
      formasi_usulan_id,
      usulan_id,
      aksi,
      sortField = "dibuat_pada",
      sortOrder = "desc",
      startDate,
      endDate,
    } = req?.query;

    const knex = RiwayatAudit.knex();
    const { customId: userId, current_role } = req?.user;

    let query = RiwayatAudit.query().withGraphFetched(
      "[formasi, usulan, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]"
    );

    if (current_role !== "admin") {
      query = query.where("dibuat_oleh", userId);
    }

    // Filter by formasi_id
    if (formasi_id) {
      query = query.where("formasi_id", formasi_id);
    }

    // Filter by formasi_usulan_id (submission) - get usulan-level and submission-level audit logs
    // This shows ALL audit logs related to this submission (from both admin and non-admin)
    if (formasi_usulan_id) {
      const FormasiUsulan = require("@/models/perencanaan/perencanaan.formasi_usulan.model");

      // Get the submission to find its formasi_id
      const submission = await FormasiUsulan.query()
        .findById(formasi_usulan_id)
        .select("formasi_id", "user_id");

      if (!submission) {
        return res.status(404).json({ message: "Pengajuan tidak ditemukan" });
      }

      // Get all usulan_ids for this submission
      const usulanIds = await Usulan.query()
        .select("usulan_id")
        .where("formasi_usulan_id", formasi_usulan_id);

      const ids = usulanIds.map((u) => u.usulan_id);

      // Filter by:
      // 1. usulan_id IN (submission's usulans) - for usulan-level actions (CREATE, UPDATE jabatan)
      // 2. OR submission-level actions where data_lama or data_baru contains this formasi_usulan_id
      // 3. OR DELETE actions where data_lama contains this formasi_usulan_id (since deleted usulan_id won't be in ids)
      query = query.where(function () {
        // Usulan-level audit logs for existing usulans
        if (ids.length > 0) {
          this.whereIn("usulan_id", ids);
        }
        // Submission-level audit logs (usulan_id is null)
        // Check if data_lama or data_baru contains formasi_usulan_id matching this submission
        // PostgreSQL JSONB syntax: ->> extracts as text
        this.orWhere(function () {
          this.whereNull("usulan_id")
            .where(function () {
              // JSONB contains formasi_usulan_id in data_lama
              this.whereRaw("data_lama->>'formasi_usulan_id' = ?", [
                formasi_usulan_id,
              ])
                // OR JSONB contains formasi_usulan_id in data_baru
                .orWhereRaw("data_baru->>'formasi_usulan_id' = ?", [
                  formasi_usulan_id,
                ]);
            });
        });
        // DELETE actions - usulan_id is set but the record no longer exists
        // So we check data_lama for formasi_usulan_id
        this.orWhere(function () {
          this.where("aksi", "DELETE")
            .whereRaw("data_lama->>'formasi_usulan_id' = ?", [
              formasi_usulan_id,
            ]);
        });
      });
    }

    // Filter by usulan_id
    if (usulan_id) {
      query = query.where("usulan_id", usulan_id);
    }

    // Filter by aksi - support multiple aksi with comma-separated values
    if (aksi) {
      const aksiList = aksi.split(",").map((a) => a.trim());
      if (aksiList.length === 1) {
        query = query.where("aksi", aksiList[0]);
      } else {
        query = query.whereIn("aksi", aksiList);
      }
    }

    // Filter by date range - include the entire end date (until 23:59:59)
    if (startDate && endDate) {
      const startDateTime = `${startDate} 00:00:00`;
      const endDateTime = `${endDate} 23:59:59`;
      query = query.whereBetween("dibuat_pada", [startDateTime, endDateTime]);
    } else if (startDate) {
      query = query.where("dibuat_pada", ">=", `${startDate} 00:00:00`);
    } else if (endDate) {
      query = query.where("dibuat_pada", "<=", `${endDate} 23:59:59`);
    }

    // Filter by operator (dibuat_oleh) - search by custom_id
    if (req?.query?.operator) {
      query = query.where("dibuat_oleh", req.query.operator);
    }

    // Search - search by operator name using subquery
    if (search) {
      query = query.where((builder) => {
        builder
          .where("riwayat_audit_id", "ilike", `%${search}%`)
          .orWhere("aksi", "ilike", `%${search}%`)
          .orWhere("ip_address", "ilike", `%${search}%`)
          // Search by operator username
          .orWhereExists(function () {
            this.select(knex.raw("1"))
              .from("users")
              .whereRaw(
                `users.custom_id = "perencanaan"."riwayat_audit".dibuat_oleh AND users.username ILIKE ?`,
                [`%${search}%`]
              );
          });
      });
    }

    // Sorting
    const order = sortOrder === "ascend" ? "asc" : "desc";
    query = query.orderBy(sortField, order);

    // Helper to transform audit data
    const transformAudit = async (auditList) => {
      return Promise.all(
        auditList.map(async (item) => {
          // Get nama_jabatan from data_baru or data_lama
          const jabatanId =
            item.data_baru?.jabatan_id || item.data_lama?.jabatan_id;
          const jenisJabatan =
            item.data_baru?.jenis_jabatan || item.data_lama?.jenis_jabatan;
          const unitKerja =
            item.data_baru?.unit_kerja || item.data_lama?.unit_kerja;

          const namaJabatan = await getJabatanName(
            knex,
            jabatanId,
            jenisJabatan
          );
          const unitKerjaText = await getUnitKerjaHierarchy(knex, unitKerja);

          return {
            ...item,
            nama_jabatan: namaJabatan,
            unit_kerja_text: unitKerjaText,
          };
        })
      );
    };

    // Pagination
    if (parseInt(limit) === -1) {
      const result = await query;
      const transformedData = await transformAudit(result);
      const rekapByAksi = result.reduce((acc, item) => {
        acc[item.aksi] = (acc[item.aksi] || 0) + 1;
        return acc;
      }, {});

      const rekap = {
        total: result.length,
        aksi: rekapByAksi,
      };

      return res.json({ data: transformedData, rekap });
    }

    const result = await query.page(parseInt(page) - 1, parseInt(limit));
    const transformedData = await transformAudit(result.results);

    res.json({
      data: transformedData,
      meta: {
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.total / parseInt(limit)),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get riwayat audit by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await RiwayatAudit.query()
      .findById(id)
      .withGraphFetched(
        "[formasi, usulan, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]"
      );

    if (!result) {
      return res.status(404).json({ message: "Riwayat audit tidak ditemukan" });
    }

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get riwayat audit by usulan_id
 */
const getByUsulanId = async (req, res) => {
  try {
    const { usulan_id } = req?.query;

    const result = await RiwayatAudit.query()
      .where("usulan_id", usulan_id)
      .withGraphFetched(
        "[formasi, usulan, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]"
      )
      .orderBy("dibuat_pada", "desc");

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get riwayat audit by formasi_id
 */
const getByFormasiId = async (req, res) => {
  try {
    const { formasi_id } = req?.query;
    const { customId: userId, current_role } = req?.user;

    const result = await RiwayatAudit.query()
      .where("formasi_id", formasi_id)
      .where((builder) => {
        if (current_role !== "admin") {
          builder.where("dibuat_oleh", userId);
        }
      })
      .withGraphFetched(
        "[formasi, usulan, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]"
      )
      .orderBy("dibuat_pada", "desc");

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAll,
  getById,
  getByUsulanId,
  getByFormasiId,
};
