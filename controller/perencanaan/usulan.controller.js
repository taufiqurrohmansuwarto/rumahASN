const Usulan = require("@/models/perencanaan/perencanaan.usulan.model");
const Formasi = require("@/models/perencanaan/perencanaan.formasi.model");
const RiwayatAudit = require("@/models/perencanaan/perencanaan.riwayat_audit.model");

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

// Helper function to get pendidikan details by IDs
const getPendidikanDetails = async (knex, pendidikanIds) => {
  if (
    !pendidikanIds ||
    !Array.isArray(pendidikanIds) ||
    pendidikanIds.length === 0
  ) {
    return [];
  }

  const result = await knex.raw(
    `SELECT rsp.id as value, stk.nama as tk_pend, rsp.nama as label 
     FROM ref_siasn.pendidikan rsp 
     LEFT JOIN siasn_tk_pend stk ON stk.id::text = rsp.tk_pendidikan_id::text 
     WHERE rsp.id IN (${pendidikanIds.map(() => "?").join(",")})`,
    pendidikanIds
  );
  return result.rows || [];
};

/**
 * Get all usulan
 */
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      formasi_id,
      jenis_jabatan,
      unit_kerja,
      sortField = "dibuat_pada",
      sortOrder = "desc",
    } = req?.query;

    const knex = Usulan.knex();

    const { customId: userId, current_role, organization_id } = req?.user;

    // Determine opd_id based on role
    // Admin can see all (opd_id = 1), non-admin uses their organization_id
    const opdId = current_role === "admin" ? "1" : organization_id;

    let query = Usulan.query().withGraphFetched(
      "[formasi, lampiran, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect), diverifikasiOleh(simpleSelect)]"
    );

    // Hierarchical access control based on organization
    // User can see usulan where unit_kerja starts with their opdId
    // E.g., user with opdId 123 can see unit_kerja 123, 12345, 123456, etc.
    if (opdId && opdId !== "1") {
      query = query.where("unit_kerja", "ilike", `${opdId}%`);
    }
    // Admin (opdId = 1) can see all, no filter needed

    // Filter by status
    if (status) {
      query = query.where("status", status);
    }

    // Filter by formasi_id
    if (formasi_id) {
      query = query.where("formasi_id", formasi_id);
    }

    // Filter by jenis_jabatan
    if (jenis_jabatan) {
      query = query.where("jenis_jabatan", jenis_jabatan);
    }

    // Filter by unit_kerja (prefix match like '123%')
    if (unit_kerja) {
      query = query.where("unit_kerja", "ilike", `${unit_kerja}%`);
    }

    // Filter by jabatan_id (exact match)
    if (req?.query?.jabatan_id) {
      query = query.where("jabatan_id", req.query.jabatan_id);
    }

    // Search - search across usulan_id, jabatan_id, unit_kerja, and also nama_jabatan from simaster tables
    if (search) {
      query = query.where((builder) => {
        builder
          .where("usulan_id", "ilike", `%${search}%`)
          .orWhere("jabatan_id", "ilike", `%${search}%`)
          .orWhere("unit_kerja", "ilike", `%${search}%`)
          // Search nama jabatan from simaster_jft (fungsional)
          .orWhereExists(function () {
            this.select(knex.raw("1"))
              .from("simaster_jft")
              .whereRaw(
                `simaster_jft.id = "perencanaan"."usulan".jabatan_id AND "perencanaan"."usulan".jenis_jabatan = 'fungsional' AND CONCAT(simaster_jft.name, ' ', simaster_jft.jenjang_jab, ' - ', simaster_jft.gol_ruang) ILIKE ?`,
                [`%${search}%`]
              );
          })
          // Search nama jabatan from simaster_jfu (pelaksana)
          .orWhereExists(function () {
            this.select(knex.raw("1"))
              .from("simaster_jfu")
              .whereRaw(
                `simaster_jfu.id = "perencanaan"."usulan".jabatan_id AND "perencanaan"."usulan".jenis_jabatan = 'pelaksana' AND simaster_jfu.name ILIKE ?`,
                [`%${search}%`]
              );
          });
      });
    }

    // Sorting
    const order = sortOrder === "ascend" ? "asc" : "desc";
    query = query.orderBy(sortField, order);

    // Helper to transform usulan data
    const transformUsulan = async (usulanList) => {
      return Promise.all(
        usulanList.map(async (item) => {
          // Get jabatan name
          const namaJabatan = await getJabatanName(
            knex,
            item.jabatan_id,
            item.jenis_jabatan
          );

          // Get unit kerja hierarchy
          const unitKerjaHierarchy = await getUnitKerjaHierarchy(
            knex,
            item.unit_kerja
          );

          // Get pendidikan details
          const pendidikanDetails = await getPendidikanDetails(
            knex,
            item.kualifikasi_pendidikan
          );

          return {
            ...item,
            nama_jabatan: namaJabatan,
            unit_kerja_text: unitKerjaHierarchy,
            kualifikasi_pendidikan_detail: pendidikanDetails,
          };
        })
      );
    };

    // Pagination
    if (parseInt(limit) === -1) {
      const result = await query;
      const transformedData = await transformUsulan(result);

      // Calculate allocation stats from the result
      const totalAlokasi = result.reduce((acc, x) => acc + (x.alokasi || 0), 0);
      const alokasiDisetujui = result
        .filter((x) => x.status === "disetujui")
        .reduce((acc, x) => acc + (x.alokasi || 0), 0);
      const alokasiDitolak = result
        .filter((x) => x.status === "ditolak")
        .reduce((acc, x) => acc + (x.alokasi || 0), 0);
      const alokasiMenunggu = result
        .filter((x) => x.status === "menunggu")
        .reduce((acc, x) => acc + (x.alokasi || 0), 0);
      const alokasiPerbaikan = result
        .filter((x) => x.status === "perbaikan")
        .reduce((acc, x) => acc + (x.alokasi || 0), 0);

      const rekap = {
        total: result.length,
        disetujui: result.filter((x) => x.status === "disetujui").length,
        ditolak: result.filter((x) => x.status === "ditolak").length,
        menunggu: result.filter((x) => x.status === "menunggu").length,
        perbaikan: result.filter((x) => x.status === "perbaikan").length,
        // Allocation stats
        total_alokasi: totalAlokasi,
        alokasi_disetujui: alokasiDisetujui,
        alokasi_ditolak: alokasiDitolak,
        alokasi_menunggu: alokasiMenunggu,
        alokasi_perbaikan: alokasiPerbaikan,
      };

      return res.json({ data: transformedData, rekap });
    }

    const result = await query.page(parseInt(page) - 1, parseInt(limit));
    const transformedData = await transformUsulan(result.results);

    // Get rekap stats (counts and allocation sums by status)
    let rekapQueryBuilder = Usulan.query();

    // Hierarchical access control for statistics
    // Non-admin only sees stats for usulan in their organization hierarchy
    if (opdId && opdId !== "1") {
      rekapQueryBuilder = rekapQueryBuilder.where(
        "unit_kerja",
        "ilike",
        `${opdId}%`
      );
    }

    const rekapQuery = await rekapQueryBuilder
      .where((builder) => {
        if (formasi_id) builder.where("formasi_id", formasi_id);
        if (jenis_jabatan) builder.where("jenis_jabatan", jenis_jabatan);
        if (unit_kerja) builder.where("unit_kerja", "ilike", `${unit_kerja}%`);
      })
      .select(
        // Count by status
        knex.raw("COUNT(*) FILTER (WHERE status = 'disetujui') as disetujui"),
        knex.raw("COUNT(*) FILTER (WHERE status = 'ditolak') as ditolak"),
        knex.raw("COUNT(*) FILTER (WHERE status = 'menunggu') as menunggu"),
        knex.raw("COUNT(*) FILTER (WHERE status = 'perbaikan') as perbaikan"),
        // Allocation sums by status
        knex.raw("COALESCE(SUM(alokasi), 0) as total_alokasi"),
        knex.raw(
          "COALESCE(SUM(alokasi) FILTER (WHERE status = 'disetujui'), 0) as alokasi_disetujui"
        ),
        knex.raw(
          "COALESCE(SUM(alokasi) FILTER (WHERE status = 'ditolak'), 0) as alokasi_ditolak"
        ),
        knex.raw(
          "COALESCE(SUM(alokasi) FILTER (WHERE status = 'menunggu'), 0) as alokasi_menunggu"
        ),
        knex.raw(
          "COALESCE(SUM(alokasi) FILTER (WHERE status = 'perbaikan'), 0) as alokasi_perbaikan"
        )
      )
      .first();

    res.json({
      data: transformedData,
      meta: {
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.total / parseInt(limit)),
      },
      rekap: {
        total: result.total,
        disetujui: parseInt(rekapQuery?.disetujui || 0),
        ditolak: parseInt(rekapQuery?.ditolak || 0),
        menunggu: parseInt(rekapQuery?.menunggu || 0),
        perbaikan: parseInt(rekapQuery?.perbaikan || 0),
        // Allocation stats
        total_alokasi: parseInt(rekapQuery?.total_alokasi || 0),
        alokasi_disetujui: parseInt(rekapQuery?.alokasi_disetujui || 0),
        alokasi_ditolak: parseInt(rekapQuery?.alokasi_ditolak || 0),
        alokasi_menunggu: parseInt(rekapQuery?.alokasi_menunggu || 0),
        alokasi_perbaikan: parseInt(rekapQuery?.alokasi_perbaikan || 0),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get usulan by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req?.query;
    const knex = Usulan.knex();
    const { current_role, organization_id } = req?.user;

    // Determine opd_id based on role
    const opdId = current_role === "admin" ? "1" : organization_id;

    let query = Usulan.query()
      .findById(id)
      .withGraphFetched(
        "[formasi, lampiran, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect), diverifikasiOleh(simpleSelect)]"
      );

    // Hierarchical access control - user can see usulan in their organization hierarchy
    if (opdId && opdId !== "1") {
      query = query.where("unit_kerja", "ilike", `${opdId}%`);
    }

    const result = await query;

    if (!result) {
      return res.status(404).json({ message: "Usulan tidak ditemukan" });
    }

    // Get jabatan name
    const namaJabatan = await getJabatanName(
      knex,
      result.jabatan_id,
      result.jenis_jabatan
    );

    // Get unit kerja hierarchy
    const unitKerjaHierarchy = await getUnitKerjaHierarchy(
      knex,
      result.unit_kerja
    );

    // Get pendidikan details
    const pendidikanDetails = await getPendidikanDetails(
      knex,
      result.kualifikasi_pendidikan
    );

    res.json({
      ...result,
      nama_jabatan: namaJabatan,
      unit_kerja_text: unitKerjaHierarchy,
      kualifikasi_pendidikan_detail: pendidikanDetails,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Create usulan
 */
const create = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const {
      formasi_id,
      jenis_jabatan,
      jabatan_id,
      kualifikasi_pendidikan,
      alokasi,
      unit_kerja,
      lampiran_id,
      catatan,
      alasan_perbaikan,
    } = req?.body;

    // Validate formasi exists and is active
    const formasi = await Formasi.query().findById(formasi_id);
    if (!formasi) {
      return res.status(404).json({ message: "Formasi tidak ditemukan" });
    }
    if (formasi.status !== "aktif") {
      return res.status(400).json({
        message: "Formasi tidak aktif, tidak dapat membuat usulan",
      });
    }

    const result = await Usulan.query().insert({
      formasi_id,
      jenis_jabatan,
      jabatan_id,
      kualifikasi_pendidikan: kualifikasi_pendidikan || null,
      alokasi,
      unit_kerja,
      status: "menunggu",
      lampiran_id: lampiran_id || null,
      catatan: catatan || null,
      alasan_perbaikan: alasan_perbaikan || null,
      dibuat_oleh: userId,
      diperbarui_oleh: userId,
    });

    // Create audit log
    await RiwayatAudit.query().insert({
      formasi_id,
      usulan_id: result.usulan_id,
      aksi: "CREATE",
      data_baru: result,
      dibuat_oleh: userId,
      ip_address: req?.ip || req?.connection?.remoteAddress,
    });

    res.json({ code: 200, message: "Usulan berhasil dibuat", data: result });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update usulan
 */
const update = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId } = req?.user;
    const isAdmin = req?.user?.current_role === "admin";
    const {
      jenis_jabatan,
      jabatan_id,
      kualifikasi_pendidikan,
      alokasi,
      unit_kerja,
      lampiran_id,
      catatan,
      alasan_perbaikan,
    } = req?.body;

    const usulan = await Usulan.query().findById(id);

    if (!usulan) {
      return res.status(404).json({ message: "Usulan tidak ditemukan" });
    }

    // Non-admin hanya boleh update usulan miliknya sendiri
    if (!isAdmin && usulan.dibuat_oleh !== userId) {
      return res.status(403).json({
        message: "Anda tidak memiliki akses untuk mengubah usulan ini",
      });
    }

    // Check if formasi is active
    const formasi = await Formasi.query().findById(usulan.formasi_id);
    if (formasi && formasi.status !== "aktif") {
      return res.status(400).json({
        message: "Formasi tidak aktif, tidak dapat mengubah usulan",
      });
    }

    // Non-admin hanya boleh update jika status belum disetujui
    if (!isAdmin && usulan.status === "disetujui") {
      return res
        .status(403)
        .json({ message: "Usulan sudah disetujui, tidak bisa diubah" });
    }

    // Store old data for audit
    const dataLama = { ...usulan };

    const updateData = {
      diperbarui_oleh: userId,
    };

    if (jenis_jabatan !== undefined) updateData.jenis_jabatan = jenis_jabatan;
    if (jabatan_id !== undefined) updateData.jabatan_id = jabatan_id;
    if (kualifikasi_pendidikan !== undefined)
      updateData.kualifikasi_pendidikan = kualifikasi_pendidikan;
    if (alokasi !== undefined) updateData.alokasi = alokasi;
    if (unit_kerja !== undefined) updateData.unit_kerja = unit_kerja;
    if (lampiran_id !== undefined) updateData.lampiran_id = lampiran_id;
    if (catatan !== undefined) updateData.catatan = catatan;
    if (alasan_perbaikan !== undefined)
      updateData.alasan_perbaikan = alasan_perbaikan;

    // If status is perbaikan, update status to menunggu
    if (usulan.status === "perbaikan" && alasan_perbaikan) {
      updateData.status = "menunggu";
    }

    await Usulan.query().findById(id).patch(updateData);

    // Get updated data
    const dataBaru = await Usulan.query().findById(id);

    // Create audit log
    await RiwayatAudit.query().insert({
      formasi_id: usulan.formasi_id,
      usulan_id: id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: dataBaru,
      dibuat_oleh: userId,
      ip_address: req?.ip || req?.connection?.remoteAddress,
    });

    res.json({ code: 200, message: "Usulan berhasil diperbarui" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update status usulan (verifikasi)
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId } = req?.user;
    if (req?.user?.current_role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { status, alasan_perbaikan, catatan } = req?.body;

    const usulan = await Usulan.query().findById(id);

    if (!usulan) {
      return res.status(404).json({ message: "Usulan tidak ditemukan" });
    }

    // Store old data for audit
    const dataLama = { ...usulan };

    const updateData = {
      status,
      diperbarui_oleh: userId,
    };

    if (status === "disetujui" || status === "ditolak") {
      updateData.diverifikasi_oleh = userId;
      updateData.diverifikasi_pada = new Date().toISOString();
    }

    if (status === "perbaikan" && alasan_perbaikan) {
      updateData.alasan_perbaikan = alasan_perbaikan;
    }

    // Update catatan if provided
    if (catatan !== undefined) {
      updateData.catatan = catatan;
    }

    await Usulan.query().findById(id).patch(updateData);

    // Get updated data
    const dataBaru = await Usulan.query().findById(id);

    // Create audit log
    await RiwayatAudit.query().insert({
      formasi_id: usulan.formasi_id,
      usulan_id: id,
      aksi: `VERIFY_${status.toUpperCase()}`,
      data_lama: dataLama,
      data_baru: dataBaru,
      dibuat_oleh: userId,
      ip_address: req?.ip || req?.connection?.remoteAddress,
    });

    res.json({
      code: 200,
      message: `Status usulan berhasil diperbarui menjadi ${status}`,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete usulan
 */
const remove = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId } = req?.user;
    const isAdmin = req?.user?.current_role === "admin";

    const usulan = await Usulan.query().findById(id);

    if (!usulan) {
      return res.status(404).json({ message: "Usulan tidak ditemukan" });
    }

    const isOwner = usulan.dibuat_oleh === userId;

    // Non-admin hanya boleh hapus usulan miliknya sendiri
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: "Anda tidak memiliki akses untuk menghapus usulan ini",
      });
    }

    // Check if formasi is active
    const formasi = await Formasi.query().findById(usulan.formasi_id);
    if (formasi && formasi.status !== "aktif") {
      return res.status(400).json({
        message: "Formasi tidak aktif, tidak dapat menghapus usulan",
      });
    }

    // Non-admin owner hanya boleh hapus jika status === "menunggu"
    if (!isAdmin && isOwner && usulan.status !== "menunggu") {
      return res.status(403).json({
        message: `Usulan dengan status "${usulan.status}" tidak bisa dihapus. Hanya usulan dengan status "menunggu" yang bisa dihapus.`,
      });
    }

    // Store data for audit
    const dataLama = { ...usulan };

    await Usulan.query().deleteById(id);

    // Create audit log
    await RiwayatAudit.query().insert({
      formasi_id: usulan.formasi_id,
      usulan_id: id,
      aksi: "DELETE",
      data_lama: dataLama,
      dibuat_oleh: userId,
      ip_address: req?.ip || req?.connection?.remoteAddress,
    });

    res.json({ code: 200, message: "Usulan berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  remove,
};
