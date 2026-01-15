const FormasiUsulan = require("@/models/perencanaan/perencanaan.formasi_usulan.model");
const Formasi = require("@/models/perencanaan/perencanaan.formasi.model");
const RiwayatAudit = require("@/models/perencanaan/perencanaan.riwayat_audit.model");
const {
  uploadFilePublic,
  generatePublicUrl,
  deleteFilePublic,
  parseMinioUrl,
  downloadFileAsBuffer,
} = require("@/utils/helper/minio-helper");
const { handleError } = require("@/utils/helper/controller-helper");
const { nanoid } = require("nanoid");

/**
 * Get all formasi usulan
 */
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      formasi_id,
      sortField = "dibuat_pada",
      sortOrder = "desc",
    } = req?.query;

    const { customId: userId, current_role } = req?.user;
    const isAdmin = current_role === "admin";
    const knex = FormasiUsulan.knex();

    let query = FormasiUsulan.query().withGraphFetched(
      "[formasi, pembuat(simpleWithImage), korektor(simpleSelect), usulan]"
    );

    // Filter by formasi_id
    if (formasi_id) {
      query = query.where("formasi_id", formasi_id);
    }

    // Access Control: Non-admin can only see their own submissions
    if (!isAdmin) {
      query = query.where("user_id", userId);
    }

    // Filter by status
    if (status) {
      query = query.where("status", status);
    }

    // Search (by user name)
    if (search) {
      query = query.whereExists(function () {
        this.select(knex.raw("1"))
          .from("users")
          .whereRaw(
            `users.custom_id = "perencanaan"."formasi_usulan".user_id AND users.username ILIKE ?`,
            [`%${search}%`]
          );
      });
    }

    // Sorting
    const order = sortOrder === "ascend" ? "asc" : "desc";
    query = query.orderBy(sortField, order);

    // Transform function to add stats
    const transformData = (items) => {
      return items.map((item) => {
        const usulanList = item.usulan || [];
        const jumlahUsulan = usulanList.length;
        const jumlahDisetujui = usulanList.filter((u) => u.status === "disetujui").length;
        // Total alokasi hanya dari usulan yang sudah disetujui/diverifikasi
        const totalAlokasi = usulanList
          .filter((u) => u.status === "disetujui")
          .reduce((acc, u) => acc + (u.alokasi || 0), 0);
        const totalAlokasiSemua = usulanList.reduce(
          (acc, u) => acc + (u.alokasi || 0),
          0
        );
        return {
          ...item,
          jumlah_usulan: jumlahUsulan,
          jumlah_disetujui: jumlahDisetujui,
          total_alokasi: totalAlokasi,
          total_alokasi_semua: totalAlokasiSemua,
          usulan: undefined, // Remove usulan array from response to keep it clean
        };
      });
    };

    // Pagination
    if (parseInt(limit) === -1) {
      const result = await query;
      const transformedData = transformData(result);
      return res.json({ data: transformedData });
    }

    const result = await query.page(parseInt(page) - 1, parseInt(limit));
    const transformedData = transformData(result.results);

    // Get rekap stats
    let rekapQuery = FormasiUsulan.query();
    if (formasi_id) {
      rekapQuery = rekapQuery.where("formasi_id", formasi_id);
    }
    if (!isAdmin) {
      rekapQuery = rekapQuery.where("user_id", userId);
    }

    const rekap = await rekapQuery
      .select(
        knex.raw("COUNT(*) FILTER (WHERE status = 'draft') as draft"),
        knex.raw("COUNT(*) FILTER (WHERE status = 'menunggu') as menunggu"),
        knex.raw("COUNT(*) FILTER (WHERE status = 'disetujui') as disetujui"),
        knex.raw("COUNT(*) FILTER (WHERE status = 'ditolak') as ditolak"),
        knex.raw("COUNT(*) FILTER (WHERE status = 'perbaikan') as perbaikan")
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
        draft: parseInt(rekap?.draft || 0),
        menunggu: parseInt(rekap?.menunggu || 0),
        disetujui: parseInt(rekap?.disetujui || 0),
        ditolak: parseInt(rekap?.ditolak || 0),
        perbaikan: parseInt(rekap?.perbaikan || 0),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get formasi usulan by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId, current_role } = req?.user;
    const isAdmin = current_role === "admin";

    const result = await FormasiUsulan.query()
      .findById(id)
      .withGraphFetched(
        "[formasi, pembuat(simpleWithImage), korektor(simpleSelect), usulan]"
      );

    if (!result) {
      return res.status(404).json({ message: "Pengajuan tidak ditemukan" });
    }

    // Access check
    if (!isAdmin && result.user_id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Add stats
    const usulanList = result.usulan || [];
    const jumlahUsulan = usulanList.length;
    const jumlahDisetujui = usulanList.filter((u) => u.status === "disetujui").length;
    // Total alokasi hanya dari usulan yang sudah disetujui/diverifikasi
    const totalAlokasi = usulanList
      .filter((u) => u.status === "disetujui")
      .reduce((acc, u) => acc + (u.alokasi || 0), 0);
    const totalAlokasiSemua = usulanList.reduce(
      (acc, u) => acc + (u.alokasi || 0),
      0
    );

    res.json({
      ...result,
      jumlah_usulan: jumlahUsulan,
      jumlah_disetujui: jumlahDisetujui,
      total_alokasi: totalAlokasi,
      total_alokasi_semua: totalAlokasiSemua,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Create new formasi usulan (Draft)
 */
const create = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { formasi_id } = req?.body;

    // Validate formasi exists and is active
    const formasi = await Formasi.query().findById(formasi_id);
    if (!formasi) {
      return res.status(404).json({ message: "Formasi tidak ditemukan" });
    }
    if (formasi.status !== "aktif") {
      return res.status(400).json({
        message: "Formasi tidak aktif, tidak dapat membuat pengajuan",
      });
    }

    // Check if user already has an active submission for this formasi?
    // Optional rule: One active submission per user per formasi
    /*
    const existing = await FormasiUsulan.query()
      .where("formasi_id", formasi_id)
      .where("user_id", userId)
      .first();
    if (existing) {
       return res.status(400).json({ message: "Anda sudah memiliki pengajuan untuk formasi ini." });
    }
    */

    const result = await FormasiUsulan.query().insert({
      formasi_id,
      user_id: userId,
      status: "draft",
      is_confirmed: false,
      dibuat_oleh: userId,
      diperbarui_oleh: userId,
    });

    res.json({
      code: 200,
      message: "Pengajuan berhasil dibuat",
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update formasi usulan (User updates details, Admin updates status)
 */
const update = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId, current_role } = req?.user;
    const isAdmin = current_role === "admin";
    const { status, catatan, is_confirmed } = req?.body;

    const formasiUsulan = await FormasiUsulan.query().findById(id);

    if (!formasiUsulan) {
      return res.status(404).json({ message: "Pengajuan tidak ditemukan" });
    }

    const updateData = {
      diperbarui_oleh: userId,
    };

    // Admin Logic: Verify (Status Change)
    if (isAdmin) {
      if (status) updateData.status = status;
      if (catatan !== undefined) updateData.catatan = catatan;

      if (status === "disetujui" || status === "ditolak" || status === "perbaikan") {
        updateData.corrector_id = userId;
        updateData.corrected_at = new Date().toISOString();
      }
    } 
    // User Logic: Confirm Submission
    else {
      if (formasiUsulan.user_id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // User can only update if status is draft or perbaikan
      if (formasiUsulan.status !== 'draft' && formasiUsulan.status !== 'perbaikan') {
         return res.status(400).json({ message: "Pengajuan tidak dapat diubah karena status bukan Draft atau Perbaikan." });
      }

      if (is_confirmed !== undefined) {
         updateData.is_confirmed = is_confirmed;
         if (is_confirmed) {
             updateData.status = 'menunggu'; // Set to waiting verification
         }
      }
    }

    await FormasiUsulan.query().findById(id).patch(updateData);

    // Audit Log
    await RiwayatAudit.query().insert({
      formasi_id: formasiUsulan.formasi_id,
      // usulan_id is null here as this is formasi_usulan level
      aksi: isAdmin ? `VERIFY_SUBMISSION_${status?.toUpperCase()}` : "UPDATE_SUBMISSION",
      data_lama: formasiUsulan,
      data_baru: { ...formasiUsulan, ...updateData },
      dibuat_oleh: userId,
      ip_address: req?.ip || req?.connection?.remoteAddress,
    });

    res.json({ code: 200, message: "Pengajuan berhasil diperbarui" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Upload Dokumen Pendukung (Single File)
 */
const uploadDokumen = async (req, res) => {
  try {
    const { id } = req?.query; // formasi_usulan_id
    const { mc, file } = req;
    const { customId: userId } = req?.user;

    if (!file) {
      return res.status(400).json({ message: "File tidak ditemukan" });
    }

    const formasiUsulan = await FormasiUsulan.query().findById(id);
    if (!formasiUsulan) {
      return res.status(404).json({ message: "Pengajuan tidak ditemukan" });
    }

    // Check permission
    if (formasiUsulan.user_id !== userId) {
       return res.status(403).json({ message: "Forbidden" });
    }

    const uniqueId = nanoid(8);
    const filename = `perencanaan/dokumen/${id}/${uniqueId}-${file.originalname}`;

    await uploadFilePublic(
      mc,
      file.buffer,
      filename,
      file.size,
      file.mimetype,
      {
        "uploaded-by": userId,
        "formasi-usulan-id": id,
        "original-name": file.originalname,
      }
    );

    const fileUrl = generatePublicUrl(filename);

    // Delete old file if exists
    if (formasiUsulan.dokumen_url) {
        const oldUrlInfo = parseMinioUrl(formasiUsulan.dokumen_url);
        if (oldUrlInfo) {
             try { await deleteFilePublic(mc, oldUrlInfo.filename); } catch (e) {}
        }
    }

    await FormasiUsulan.query().findById(id).patch({
        dokumen_url: fileUrl,
        dokumen_name: file.originalname,
        diperbarui_oleh: userId
    });

    res.json({ code: 200, message: "Dokumen berhasil diunggah", data: { url: fileUrl } });

  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Download Dokumen
 */
const downloadDokumen = async (req, res) => {
    try {
        const { id } = req?.query;
        const { mc } = req;

        const formasiUsulan = await FormasiUsulan.query().findById(id);
        if (!formasiUsulan || !formasiUsulan.dokumen_url) {
            return res.status(404).json({ message: "Dokumen tidak ditemukan" });
        }

        const urlInfo = parseMinioUrl(formasiUsulan.dokumen_url);
        const fileBuffer = await downloadFileAsBuffer(mc, urlInfo.bucket, urlInfo.filename);

        res.setHeader("Content-Disposition", `attachment; filename="${formasiUsulan.dokumen_name}"`);
        res.end(fileBuffer);
    } catch (error) {
        handleError(res, error);
    }
}

/**
 * Delete Submission
 */
const remove = async (req, res) => {
    try {
        const { id } = req?.query;
        const { customId: userId, current_role } = req?.user;
        const isAdmin = current_role === "admin";

        const formasiUsulan = await FormasiUsulan.query().findById(id);
        if (!formasiUsulan) return res.status(404).json({ message: "Not Found" });

        if (!isAdmin && formasiUsulan.user_id !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // Only allow delete if draft
        if (!isAdmin && formasiUsulan.status !== 'draft') {
            return res.status(400).json({ message: "Hanya draft yang dapat dihapus" });
        }

        await FormasiUsulan.query().deleteById(id);
        res.json({ code: 200, message: "Pengajuan berhasil dihapus" });

    } catch (error) {
        handleError(res, error);
    }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  uploadDokumen,
  downloadDokumen,
  remove,
};
