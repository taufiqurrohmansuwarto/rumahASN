const Usulan = require("@/models/perencanaan/perencanaan.usulan.model");
const Formasi = require("@/models/perencanaan/perencanaan.formasi.model");
const RiwayatAudit = require("@/models/perencanaan/perencanaan.riwayat_audit.model");
const { handleError } = require("@/utils/helper/controller-helper");

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

    let query = Usulan.query().withGraphFetched(
      "[formasi, lampiran, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect), diverifikasiOleh(simpleSelect)]"
    );

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

    // Filter by unit_kerja
    if (unit_kerja) {
      query = query.where("unit_kerja", "ilike", `%${unit_kerja}%`);
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

    // Pagination
    if (parseInt(limit) === -1) {
      const result = await query;
      const rekap = {
        total: result.length,
        disetujui: result.filter((x) => x.status === "disetujui").length,
        ditolak: result.filter((x) => x.status === "ditolak").length,
        menunggu: result.filter((x) => x.status === "menunggu").length,
        perbaikan: result.filter((x) => x.status === "perbaikan").length,
      };

      return res.json({ data: result, rekap });
    }

    const result = await query.page(parseInt(page) - 1, parseInt(limit));
    res.json({
      data: result.results,
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

    const result = await Usulan.query()
      .findById(id)
      .withGraphFetched(
        "[formasi, lampiran, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect), diverifikasiOleh(simpleSelect)]"
      );

    if (!result) {
      return res.status(404).json({ message: "Usulan tidak ditemukan" });
    }

    res.json(result);
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
    const { formasi_id, jenis_jabatan, jabatan_id, kualifikasi_pendidikan, alokasi, unit_kerja, lampiran_id } = req?.body;

    // Validate formasi exists
    const formasi = await Formasi.query().findById(formasi_id);
    if (!formasi) {
      return res.status(404).json({ message: "Formasi tidak ditemukan" });
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
    const { jenis_jabatan, jabatan_id, kualifikasi_pendidikan, alokasi, unit_kerja, lampiran_id, alasan_perbaikan } =
      req?.body;

    const usulan = await Usulan.query().findById(id);

    if (!usulan) {
      return res.status(404).json({ message: "Usulan tidak ditemukan" });
    }

    // Non-admin hanya boleh update jika status belum disetujui
    if (!isAdmin && usulan.status === "disetujui") {
      return res.status(403).json({ message: "Usulan sudah disetujui, tidak bisa diubah" });
    }

    // Store old data for audit
    const dataLama = { ...usulan };

    const updateData = {
      diperbarui_oleh: userId,
    };

    if (jenis_jabatan !== undefined) updateData.jenis_jabatan = jenis_jabatan;
    if (jabatan_id !== undefined) updateData.jabatan_id = jabatan_id;
    if (kualifikasi_pendidikan !== undefined) updateData.kualifikasi_pendidikan = kualifikasi_pendidikan;
    if (alokasi !== undefined) updateData.alokasi = alokasi;
    if (unit_kerja !== undefined) updateData.unit_kerja = unit_kerja;
    if (lampiran_id !== undefined) updateData.lampiran_id = lampiran_id;
    if (alasan_perbaikan !== undefined) updateData.alasan_perbaikan = alasan_perbaikan;

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
    const { status, alasan_perbaikan } = req?.body;

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

    res.json({ code: 200, message: `Status usulan berhasil diperbarui menjadi ${status}` });
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

    // Non-admin hanya boleh hapus jika status belum disetujui
    if (!isAdmin && usulan.status === "disetujui") {
      return res.status(403).json({ message: "Usulan sudah disetujui, tidak bisa dihapus" });
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

