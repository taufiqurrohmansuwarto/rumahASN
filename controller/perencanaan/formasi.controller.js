const Formasi = require("@/models/perencanaan/perencanaan.formasi.model");
const { handleError } = require("@/utils/helper/controller-helper");

/**
 * Get all formasi
 */
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, tahun, sortField = "dibuat_pada", sortOrder = "desc" } = req?.query;

    let query = Formasi.query().withGraphFetched("[dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect), usulan]");

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

    const result = await Formasi.query()
      .findById(id)
      .withGraphFetched("[dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect), usulan]");

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
    if (req?.user?.current_role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { customId: userId } = req?.user;
    const { deskripsi, tahun, status } = req?.body;

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
    if (req?.user?.current_role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req?.query;
    const { customId: userId } = req?.user;
    const { deskripsi, tahun, status } = req?.body;

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
    if (req?.user?.current_role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req?.query;

    const formasi = await Formasi.query().findById(id);

    if (!formasi) {
      return res.status(404).json({ message: "Formasi tidak ditemukan" });
    }

    // Check if formasi has usulan
    const usulanCount = await Formasi.relatedQuery("usulan").for(id).resultSize();
    if (usulanCount > 0) {
      return res.status(400).json({ 
        message: "Formasi tidak dapat dihapus karena masih memiliki usulan" 
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

