const DocumentRevisions = require("@/models/pengadaan/document-revisions.model");
const { handleError } = require("@/utils/helper/controller-helper");

// Konstanta untuk jenis perbaikan
const REVISION_TYPES = [
  { value: "nama", label: "Salah Nama" },
  { value: "nip", label: "Salah NIP" },
  { value: "tempat_lahir", label: "Salah Tempat Lahir" },
  { value: "tanggal_lahir", label: "Salah Tanggal Lahir" },
  { value: "gaji", label: "Salah Gaji" },
  { value: "pendidikan", label: "Salah Pendidikan" },
  { value: "jabatan", label: "Salah Jabatan" },
  { value: "unit_kerja", label: "Salah Unit Kerja" },
  { value: "pangkat", label: "Salah Pangkat/Golongan" },
  { value: "tmt", label: "Salah TMT" },
  { value: "lainnya", label: "Lainnya" },
];

// Konstanta untuk dokumen administrasi
const DOKUMEN_ADMINISTRASI = [
  { code: "SK", name: "SK", fullName: "Surat Keputusan" },
  { code: "PERTEK", name: "PERTEK", fullName: "Pertimbangan Teknis" },
  { code: "SPMT", name: "SPMT", fullName: "Surat Pernyataan Melaksanakan Tugas" },
  { code: "PK", name: "PK", fullName: "Perjanjian Kinerja" },
];

// Konstanta untuk TMT
const LIST_TMT = [
  { value: "01032019", label: "1 Mar 2019" },
  { value: "01022022", label: "1 Feb 2022" },
  { value: "01042024", label: "1 Apr 2024" },
  { value: "01052024", label: "1 Mei 2024" },
  { value: "01062024", label: "1 Jun 2024" },
  { value: "01072024", label: "1 Jul 2024" },
  { value: "01082024", label: "1 Ags 2024" },
  { value: "01012025", label: "1 Jan 2025" },
  { value: "01032025", label: "1 Mar 2025" },
  { value: "01062025", label: "1 Jun 2025" },
  { value: "01072025", label: "1 Jul 2025" },
  { value: "01082025", label: "1 Ags 2025" },
  { value: "01102025", label: "1 Okt 2025" },
  { value: "01012026", label: "1 Jan 2026" },
];

// ===== USER CONTROLLERS =====

/**
 * Get reference data for revision form
 * GET /api/pengadaan/document-revisions/references
 */
export const getReferences = async (req, res) => {
  try {
    res.json({
      revision_types: REVISION_TYPES,
      document_types: DOKUMEN_ADMINISTRASI,
      tmt_list: LIST_TMT,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Create document revision request
 * POST /api/pengadaan/document-revisions
 * NIP otomatis dari req.user.employee_number
 */
export const createDocumentRevision = async (req, res) => {
  try {
    const { customId, employee_number: nip } = req.user;
    const { document_type, tmt, revision_type, reason } = req.body;

    // Validasi NIP dari user
    if (!nip) {
      return res.status(400).json({
        code: 400,
        message: "NIP tidak ditemukan. Pastikan Anda sudah login dengan benar.",
      });
    }

    // Validasi required fields
    if (!document_type || !tmt || !revision_type || !reason) {
      return res.status(400).json({
        code: 400,
        message: "Semua field wajib diisi",
      });
    }

    // Validasi document_type
    const validDocType = DOKUMEN_ADMINISTRASI.find((d) => d.code === document_type);
    if (!validDocType) {
      return res.status(400).json({
        code: 400,
        message: `Jenis dokumen tidak valid. Pilihan: ${DOKUMEN_ADMINISTRASI.map((d) => d.code).join(", ")}`,
      });
    }

    // Validasi tmt
    const validTmt = LIST_TMT.find((t) => t.value === tmt);
    if (!validTmt) {
      return res.status(400).json({
        code: 400,
        message: `TMT tidak valid`,
      });
    }

    // Validasi revision_type
    const validRevisionType = REVISION_TYPES.find((r) => r.value === revision_type);
    if (!validRevisionType) {
      return res.status(400).json({
        code: 400,
        message: `Jenis perbaikan tidak valid`,
      });
    }

    // Cek apakah sudah ada pengajuan aktif untuk dokumen ini
    const existingRevision = await DocumentRevisions.query()
      .where("nip", nip)
      .where("document_type", document_type)
      .where("tmt", tmt)
      .whereIn("status", ["pending", "in_progress"])
      .first();

    if (existingRevision) {
      return res.status(409).json({
        code: 409,
        message: "Sudah ada pengajuan perbaikan yang sedang diproses untuk dokumen ini",
        existing: existingRevision,
      });
    }

    // Create revision request
    const revision = await DocumentRevisions.query().insert({
      user_id: customId,
      nip,
      document_type,
      tmt,
      revision_type,
      reason,
      status: "pending",
    });

    res.status(201).json({
      code: 201,
      message: "Pengajuan perbaikan dokumen berhasil dibuat",
      data: revision,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get my document revision requests
 * GET /api/pengadaan/document-revisions/my
 */
export const getMyDocumentRevisions = async (req, res) => {
  try {
    const { customId } = req.user;
    const { status, page = 1, limit = 10 } = req.query;

    let query = DocumentRevisions.query()
      .where("user_id", customId)
      .orderBy("created_at", "desc");

    if (status && status !== "all") {
      query = query.where("status", status);
    }

    const revisions = await query.page(parseInt(page) - 1, parseInt(limit));

    res.json({
      data: revisions.results,
      total: revisions.total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get document revision detail
 * GET /api/pengadaan/document-revisions/:id
 */
export const getDocumentRevision = async (req, res) => {
  try {
    const { customId } = req.user;
    const { id } = req.query;

    const revision = await DocumentRevisions.query()
      .findById(id)
      .where("user_id", customId)
      .withGraphFetched("[user, admin]");

    if (!revision) {
      return res.status(404).json({
        code: 404,
        message: "Pengajuan tidak ditemukan",
      });
    }

    res.json(revision);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Cancel document revision request (only if still pending)
 * DELETE /api/pengadaan/document-revisions/:id
 */
export const cancelDocumentRevision = async (req, res) => {
  try {
    const { customId } = req.user;
    const { id } = req.query;

    const revision = await DocumentRevisions.query()
      .findById(id)
      .where("user_id", customId);

    if (!revision) {
      return res.status(404).json({
        code: 404,
        message: "Pengajuan tidak ditemukan",
      });
    }

    if (revision.status !== "pending") {
      return res.status(400).json({
        code: 400,
        message: "Hanya pengajuan dengan status pending yang dapat dibatalkan",
      });
    }

    await DocumentRevisions.query().deleteById(id);

    res.json({
      code: 200,
      message: "Pengajuan berhasil dibatalkan",
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ===== ADMIN CONTROLLERS =====

/**
 * Get all document revision requests (Admin)
 * GET /api/pengadaan/admin/document-revisions
 * Query params:
 * - limit: -1 untuk mengambil semua data (untuk export)
 * - nama: filter by user name
 */
export const getAllDocumentRevisions = async (req, res) => {
  try {
    const {
      status,
      document_type,
      revision_type,
      tmt,
      search,
      nama,
      page = 1,
      limit = 10,
    } = req.query;

    let query = DocumentRevisions.query()
      .withGraphFetched("[user, admin]")
      .orderBy("created_at", "desc");

    // Filter by status
    if (status && status !== "all") {
      query = query.where("status", status);
    }

    // Filter by document type
    if (document_type) {
      query = query.where("document_type", document_type);
    }

    // Filter by revision type
    if (revision_type) {
      query = query.where("revision_type", revision_type);
    }

    // Filter by TMT
    if (tmt) {
      query = query.where("tmt", tmt);
    }

    // Search by NIP or reason
    if (search) {
      query = query.where((builder) => {
        builder
          .where("nip", "ilike", `%${search}%`)
          .orWhere("reason", "ilike", `%${search}%`);
      });
    }

    // Filter by user name (join dengan tabel users)
    if (nama) {
      query = query.whereExists(
        DocumentRevisions.relatedQuery("user").where("username", "ilike", `%${nama}%`)
      );
    }

    // Jika limit = -1, ambil semua data tanpa pagination (untuk export)
    let revisions;
    if (parseInt(limit) === -1) {
      const allData = await query;
      revisions = {
        results: allData,
        total: allData.length,
      };
    } else {
      revisions = await query.page(parseInt(page) - 1, parseInt(limit));
    }

    // Get status counts
    const statusCounts = await DocumentRevisions.query()
      .select("status")
      .count("id as total")
      .groupBy("status")
      .then((results) => {
        const counts = {
          all: 0,
          pending: 0,
          in_progress: 0,
          completed: 0,
          rejected: 0,
        };
        results.forEach((result) => {
          const count = parseInt(result.total);
          counts[result.status] = count;
          counts.all += count;
        });
        return counts;
      });

    res.json({
      data: revisions.results,
      total: revisions.total,
      page: parseInt(page),
      limit: parseInt(limit),
      statusCounts,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get document revision detail (Admin)
 * GET /api/pengadaan/admin/document-revisions/:id
 */
export const getDocumentRevisionAdmin = async (req, res) => {
  try {
    const { id } = req.query;

    const revision = await DocumentRevisions.query()
      .findById(id)
      .withGraphFetched("[user, admin]");

    if (!revision) {
      return res.status(404).json({
        code: 404,
        message: "Pengajuan tidak ditemukan",
      });
    }

    res.json(revision);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update document revision status (Admin)
 * PATCH /api/pengadaan/admin/document-revisions/:id
 */
export const updateDocumentRevisionStatus = async (req, res) => {
  try {
    const { customId } = req.user;
    const { id } = req.query;
    const { status, admin_notes } = req.body;

    // Validasi status
    const validStatuses = ["pending", "in_progress", "completed", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        code: 400,
        message: `Status tidak valid. Pilihan: ${validStatuses.join(", ")}`,
      });
    }

    const revision = await DocumentRevisions.query().findById(id);

    if (!revision) {
      return res.status(404).json({
        code: 404,
        message: "Pengajuan tidak ditemukan",
      });
    }

    // Update revision
    const updatedRevision = await DocumentRevisions.query()
      .patchAndFetchById(id, {
        status,
        admin_notes: admin_notes || revision.admin_notes,
        processed_by: customId,
        processed_at: new Date(),
      });

    res.json({
      code: 200,
      message: "Status pengajuan berhasil diperbarui",
      data: updatedRevision,
    });
  } catch (error) {
    handleError(res, error);
  }
};
