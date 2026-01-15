const Formasi = require("@/models/perencanaan/perencanaan.formasi.model");
const { handleError } = require("@/utils/helper/controller-helper");

/**
 * Get all formasi
 */
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      tahun,
      sortField = "dibuat_pada",
      sortOrder = "desc",
    } = req?.query;

    // Use formasiUsulan relation instead of usulan
    let query = Formasi.query().withGraphFetched(
      "[dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]"
    );

    // Filter by status
    if (status) {
      query = query.where("status", status);
    }

    // Filter by tahun
    if (tahun) {
      query = query.where("tahun", tahun);
    }

    // Search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("formasi_id", "ilike", `%${search}%`)
          .orWhere("deskripsi", "ilike", `%${search}%`);
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
        aktif: result.filter((x) => x.status === "aktif").length,
        nonaktif: result.filter((x) => x.status === "nonaktif").length,
      };

      return res.json({ data: result, rekap });
    }

    const result = await query.page(parseInt(page) - 1, parseInt(limit));
    
    // Fetch summary counts manually or via subquery if needed, 
    // but for now let's just return formasi data to fix the error.
    // If frontend needs total usulan, we can add it later.
    
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
 * Get formasi by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req?.query;

    // Remove eager fetch of usulan, fetching formasiUsulan instead if needed
    // or just basic details. Frontend will fetch sub-lists separately.
    const result = await Formasi.query()
      .findById(id)
      .withGraphFetched(
        "[dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]"
      );

    if (!result) {
      return res.status(404).json({ message: "Formasi tidak ditemukan" });
    }

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Create formasi
 */
const create = async (req, res) => {
  try {
    const { customId: userId, current_role } = req?.user;
    const { deskripsi, tahun, status } = req?.body;

    if (current_role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const result = await Formasi.query().insert({
      deskripsi,
      tahun,
      status: status || "aktif",
      dibuat_oleh: userId,
      diperbarui_oleh: userId,
    });

    res.json({ code: 200, message: "Formasi berhasil dibuat", data: result });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update formasi
 */
const update = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: userId, current_role } = req?.user;
    const { deskripsi, tahun, status } = req?.body;

    if (current_role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const formasi = await Formasi.query().findById(id);

    if (!formasi) {
      return res.status(404).json({ message: "Formasi tidak ditemukan" });
    }

    const updateData = {
      diperbarui_oleh: userId,
    };

    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (tahun !== undefined) updateData.tahun = tahun;
    if (status !== undefined) updateData.status = status;

    await Formasi.query().findById(id).patch(updateData);

    res.json({ code: 200, message: "Formasi berhasil diperbarui" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete formasi
 */
const remove = async (req, res) => {
  try {
    const { id } = req?.query;
    const { current_role } = req?.user;

    if (current_role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const formasi = await Formasi.query().findById(id);

    if (!formasi) {
      return res.status(404).json({ message: "Formasi tidak ditemukan" });
    }

    // Check if formasi has formasiUsulan (submissions)
    const count = await Formasi.relatedQuery("formasiUsulan")
      .for(id)
      .resultSize();
      
    if (count > 0) {
      return res.status(400).json({
        message: "Formasi tidak dapat dihapus karena sudah memiliki pengajuan",
      });
    }

    await Formasi.query().deleteById(id);

    res.json({ code: 200, message: "Formasi berhasil dihapus" });
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