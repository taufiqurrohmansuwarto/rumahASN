const Usulan = require("@/models/perencanaan/perencanaan.usulan.model");
const FormasiUsulan = require("@/models/perencanaan/perencanaan.formasi_usulan.model");
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
      formasi_id, // Filter by parent formasi
      formasi_usulan_id, // New Parent ID
      jenis_jabatan,
      unit_kerja,
      sortField = "dibuat_pada",
      sortOrder = "desc",
    } = req?.query;

    const knex = Usulan.knex();

    let query = Usulan.query().withGraphFetched(
      "[lampiran, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect), diverifikasiOleh(simpleSelect), formasiUsulan.[formasi, pembuat(simpleWithImage)]]"
    );

    // Filter by formasi_id (join through formasi_usulan)
    if (formasi_id) {
      query = query
        .joinRelated("formasiUsulan")
        .where("formasiUsulan.formasi_id", formasi_id);
    }

    // Filter by formasi_usulan_id (Mandatory for context usually, but optional for admin overview)
    if (formasi_usulan_id) {
      query = query.where("formasi_usulan_id", formasi_usulan_id);
    }

    // Filter by jenis_jabatan
    if (jenis_jabatan) {
      query = query.where("jenis_jabatan", jenis_jabatan);
    }

    // Filter by unit_kerja
    if (unit_kerja) {
      query = query.where("unit_kerja", "ilike", `${unit_kerja}%`);
    }

    // Search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("usulan_id", "ilike", `%${search}%`)
          .orWhere("jabatan_id", "ilike", `%${search}%`)
          .orWhere("unit_kerja", "ilike", `%${search}%`);
      });
    }

    // Sorting
    const order = sortOrder === "ascend" ? "asc" : "desc";
    query = query.orderBy(sortField, order);

    // Helper to transform usulan data
    const transformUsulan = async (usulanList) => {
      return Promise.all(
        usulanList.map(async (item) => {
          const namaJabatan = await getJabatanName(
            knex,
            item.jabatan_id,
            item.jenis_jabatan
          );
          const unitKerjaHierarchy = await getUnitKerjaHierarchy(
            knex,
            item.unit_kerja
          );
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
      // Calculate allocation stats - only count verified (disetujui) items
      const totalAlokasi = result
        .filter((x) => x.status === "disetujui")
        .reduce((acc, x) => acc + (x.alokasi || 0), 0);
      const totalAlokasiSemua = result.reduce((acc, x) => acc + (x.alokasi || 0), 0);
      
      return res.json({ 
          data: transformedData, 
          rekap: { 
            total_alokasi: totalAlokasi, 
            total_alokasi_semua: totalAlokasiSemua,
            total: result.length,
            total_disetujui: result.filter((x) => x.status === "disetujui").length,
          } 
      });
    }

    const result = await query.page(parseInt(page) - 1, parseInt(limit));
    const transformedData = await transformUsulan(result.results);

    // Also fetch rekap stats for paginated response
    let rekapQuery = Usulan.query();
    if (formasi_usulan_id) {
      rekapQuery = rekapQuery.where("formasi_usulan_id", formasi_usulan_id);
    }
    const allUsulan = await rekapQuery;
    const totalAlokasi = allUsulan
      .filter((x) => x.status === "disetujui")
      .reduce((acc, x) => acc + (x.alokasi || 0), 0);
    const totalAlokasiSemua = allUsulan.reduce((acc, x) => acc + (x.alokasi || 0), 0);

    res.json({
      data: transformedData,
      meta: {
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.total / parseInt(limit)),
      },
      rekap: {
        total_alokasi: totalAlokasi,
        total_alokasi_semua: totalAlokasiSemua,
        total: allUsulan.length,
        total_disetujui: allUsulan.filter((x) => x.status === "disetujui").length,
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

    let query = Usulan.query()
      .findById(id)
      .withGraphFetched(
        "[lampiran, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]"
      );

    const result = await query;

    if (!result) {
      return res.status(404).json({ message: "Usulan tidak ditemukan" });
    }

    const namaJabatan = await getJabatanName(
      knex,
      result.jabatan_id,
      result.jenis_jabatan
    );
    const unitKerjaHierarchy = await getUnitKerjaHierarchy(
      knex,
      result.unit_kerja
    );
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
 * Rules:
 * - Draft + is_confirmed=false: only owner (non-admin) can create
 * - Perbaikan + is_confirmed=true: everyone (admin and owner) can create
 * - Other statuses: nobody can create
 */
const create = async (req, res) => {
  try {
    const { customId: userId, current_role } = req?.user;
    const isAdmin = current_role === "admin";
    const {
      formasi_usulan_id,
      jenis_jabatan,
      jabatan_id,
      kualifikasi_pendidikan,
      alokasi,
      unit_kerja,
      lampiran_id,
      catatan,
    } = req?.body;

    if (!formasi_usulan_id) {
      return res.status(400).json({ message: "Formasi Usulan ID wajib diisi" });
    }

    // Validate FormasiUsulan exists
    const formasiUsulan = await FormasiUsulan.query().findById(formasi_usulan_id);
    if (!formasiUsulan) {
      return res.status(404).json({ message: "Data Pengajuan tidak ditemukan" });
    }

    const { status, is_confirmed, user_id: ownerId } = formasiUsulan;

    // Determine if user can create based on rules
    let canCreate = false;
    let errorMessage = "";

    if (status === "perbaikan" && is_confirmed) {
      // Perbaikan + is_confirmed: everyone (admin and owner) can create
      if (isAdmin || ownerId === userId) {
        canCreate = true;
      } else {
        errorMessage = "Forbidden";
      }
    } else if (status === "draft" && !is_confirmed) {
      // Draft + not confirmed: only owner (non-admin) can create
      if (!isAdmin && ownerId === userId) {
        canCreate = true;
      } else if (isAdmin) {
        errorMessage = "Admin tidak dapat menambah usulan pada status draft";
      } else {
        errorMessage = "Forbidden";
      }
    } else {
      // Other statuses (menunggu, disetujui, ditolak): nobody can create
      errorMessage = `Tidak dapat menambah usulan pada status ${status}`;
    }

    if (!canCreate) {
      return res.status(403).json({ message: errorMessage });
    }

    const result = await Usulan.query().insert({
      formasi_usulan_id,
      jenis_jabatan,
      jabatan_id,
      kualifikasi_pendidikan: kualifikasi_pendidikan || null,
      alokasi,
      unit_kerja,
      lampiran_id: lampiran_id || null,
      catatan: catatan || null,
      status: "menunggu", // Default: menunggu verifikasi admin
      dibuat_oleh: userId,
      diperbarui_oleh: userId,
    });

    res.json({ code: 200, message: "Usulan berhasil ditambahkan", data: result });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update usulan
 * Rules:
 * - Draft + is_confirmed=false: only owner (non-admin) can update
 * - Perbaikan + is_confirmed=true: everyone (admin and owner) can update
 * - Other statuses: nobody can update
 */
const update = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId, current_role } = req?.user;
    const isAdmin = current_role === "admin";
    const {
      jenis_jabatan,
      jabatan_id,
      kualifikasi_pendidikan,
      alokasi,
      unit_kerja,
      lampiran_id,
      catatan,
    } = req?.body;

    const usulan = await Usulan.query().findById(id).withGraphFetched("formasiUsulan");

    if (!usulan) {
      return res.status(404).json({ message: "Usulan tidak ditemukan" });
    }

    const formasiUsulan = usulan.formasiUsulan;
    const { status, is_confirmed, user_id: ownerId } = formasiUsulan;

    // Determine if user can update based on rules
    let canUpdate = false;
    let errorMessage = "";

    if (status === "perbaikan" && is_confirmed) {
      // Perbaikan + is_confirmed: everyone (admin and owner) can update
      if (isAdmin || ownerId === userId) {
        canUpdate = true;
      } else {
        errorMessage = "Forbidden";
      }
    } else if (status === "draft" && !is_confirmed) {
      // Draft + not confirmed: only owner (non-admin) can update
      if (!isAdmin && ownerId === userId) {
        canUpdate = true;
      } else if (isAdmin) {
        errorMessage = "Admin tidak dapat mengubah usulan pada status draft";
      } else {
        errorMessage = "Forbidden";
      }
    } else {
      // Other statuses (menunggu, disetujui, ditolak): nobody can update
      errorMessage = `Tidak dapat mengubah usulan pada status ${status}`;
    }

    if (!canUpdate) {
      return res.status(403).json({ message: errorMessage });
    }

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

    await Usulan.query().findById(id).patch(updateData);

    res.json({ code: 200, message: "Usulan berhasil diperbarui" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete usulan
 * Rules:
 * - Draft + is_confirmed=false: only owner (non-admin) can delete
 * - Perbaikan + is_confirmed=true: everyone (admin and owner) can delete
 * - Other statuses: nobody can delete
 */
const remove = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId, current_role } = req?.user;
    const isAdmin = current_role === "admin";

    const usulan = await Usulan.query().findById(id).withGraphFetched("formasiUsulan");

    if (!usulan) {
      return res.status(404).json({ message: "Usulan tidak ditemukan" });
    }

    const formasiUsulan = usulan.formasiUsulan;
    const { status, is_confirmed, user_id: ownerId } = formasiUsulan;

    // Determine if user can delete based on rules
    let canDelete = false;
    let errorMessage = "";

    if (status === "perbaikan" && is_confirmed) {
      // Perbaikan + is_confirmed: everyone (admin and owner) can delete
      if (isAdmin || ownerId === userId) {
        canDelete = true;
      } else {
        errorMessage = "Forbidden";
      }
    } else if (status === "draft" && !is_confirmed) {
      // Draft + not confirmed: only owner (non-admin) can delete
      if (!isAdmin && ownerId === userId) {
        canDelete = true;
      } else if (isAdmin) {
        errorMessage = "Admin tidak dapat menghapus usulan pada status draft";
      } else {
        errorMessage = "Forbidden";
      }
    } else {
      // Other statuses (menunggu, disetujui, ditolak): nobody can delete
      errorMessage = `Tidak dapat menghapus usulan pada status ${status}`;
    }

    if (!canDelete) {
      return res.status(403).json({ message: errorMessage });
    }

    await Usulan.query().deleteById(id);

    res.json({ code: 200, message: "Usulan berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update usulan status (verifikasi per jabatan) - Admin only
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId, current_role } = req?.user;
    const isAdmin = current_role === "admin";

    if (!isAdmin) {
      return res.status(403).json({ message: "Hanya admin yang dapat memverifikasi usulan" });
    }

    const { status, catatan, alasan_perbaikan } = req?.body;

    const usulan = await Usulan.query().findById(id);

    if (!usulan) {
      return res.status(404).json({ message: "Usulan tidak ditemukan" });
    }

    // Validate status value
    const validStatuses = ["menunggu", "disetujui", "ditolak", "perbaikan"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const updateData = {
      status,
      diperbarui_oleh: userId,
      diverifikasi_oleh: userId,
      diverifikasi_pada: new Date().toISOString(),
    };

    if (catatan !== undefined) updateData.catatan = catatan;
    if (status === "perbaikan" && alasan_perbaikan) {
      updateData.alasan_perbaikan = alasan_perbaikan;
    }

    await Usulan.query().findById(id).patch(updateData);

    // Create audit log - get formasi_id from the usulan's formasiUsulan
    const formasiUsulan = await FormasiUsulan.query().findById(usulan.formasi_usulan_id);
    await RiwayatAudit.query().insert({
      usulan_id: id,
      formasi_id: formasiUsulan?.formasi_id || null,
      aksi: `verifikasi_${status}`,
      data_baru: { status, catatan },
      data_lama: { status: usulan.status },
      dibuat_oleh: userId,
    });

    res.json({ code: 200, message: "Status usulan berhasil diperbarui" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  updateStatus,
};