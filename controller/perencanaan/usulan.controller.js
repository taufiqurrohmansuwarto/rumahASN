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
      formasi_usulan_id, // New Parent ID
      jenis_jabatan,
      unit_kerja,
      sortField = "dibuat_pada",
      sortOrder = "desc",
    } = req?.query;

    const knex = Usulan.knex();

    let query = Usulan.query().withGraphFetched(
      "[lampiran, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]"
    );

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
      // Calculate allocation stats
      const totalAlokasi = result.reduce((acc, x) => acc + (x.alokasi || 0), 0);
      
      return res.json({ 
          data: transformedData, 
          rekap: { total_alokasi: totalAlokasi, total: result.length } 
      });
    }

    const result = await query.page(parseInt(page) - 1, parseInt(limit));
    const transformedData = await transformUsulan(result.results);

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
 */
const create = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const {
      formasi_usulan_id, // CHANGED: Replaces formasi_id
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

    // Validate FormasiUsulan exists and is in editable state
    const formasiUsulan = await FormasiUsulan.query().findById(formasi_usulan_id);
    if (!formasiUsulan) {
      return res.status(404).json({ message: "Data Pengajuan tidak ditemukan" });
    }
    
    // Check permission (Only owner can add)
    if (formasiUsulan.user_id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
    }

    // Check status
    if (formasiUsulan.status !== 'draft' && formasiUsulan.status !== 'perbaikan') {
        return res.status(400).json({ message: "Tidak dapat menambah usulan pada status " + formasiUsulan.status });
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

    // Validate Parent Status
    const formasiUsulan = usulan.formasiUsulan;
    
    // Non-admin can only update if owner
    if (!isAdmin && usulan.dibuat_oleh !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check status if not admin
    if (!isAdmin) {
        if (formasiUsulan.status !== 'draft' && formasiUsulan.status !== 'perbaikan') {
            return res.status(400).json({ message: "Tidak dapat mengubah usulan pada status " + formasiUsulan.status });
        }
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

    if (!isAdmin && usulan.dibuat_oleh !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check status if not admin
    if (!isAdmin) {
        const status = usulan.formasiUsulan?.status;
        if (status !== 'draft' && status !== 'perbaikan') {
            return res.status(400).json({ message: "Tidak dapat menghapus usulan pada status " + status });
        }
    }

    await Usulan.query().deleteById(id);

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
  remove,
};