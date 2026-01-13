const RiwayatAudit = require("@/models/perencanaan/perencanaan.riwayat_audit.model");
const { handleError } = require("@/utils/helper/controller-helper");

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
      usulan_id,
      aksi,
      sortField = "dibuat_pada",
      sortOrder = "desc",
      startDate,
      endDate,
    } = req?.query;

    let query = RiwayatAudit.query().withGraphFetched(
      "[formasi, usulan, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]"
    );

    // Filter by formasi_id
    if (formasi_id) {
      query = query.where("formasi_id", formasi_id);
    }

    // Filter by usulan_id
    if (usulan_id) {
      query = query.where("usulan_id", usulan_id);
    }

    // Filter by aksi
    if (aksi) {
      query = query.where("aksi", aksi);
    }

    // Filter by date range
    if (startDate && endDate) {
      query = query.whereBetween("dibuat_pada", [startDate, endDate]);
    }

    // Search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("riwayat_audit_id", "ilike", `%${search}%`)
          .orWhere("aksi", "ilike", `%${search}%`)
          .orWhere("ip_address", "ilike", `%${search}%`);
      });
    }

    // Sorting
    const order = sortOrder === "ascend" ? "asc" : "desc";
    query = query.orderBy(sortField, order);

    // Pagination
    if (parseInt(limit) === -1) {
      const result = await query;
      const rekapByAksi = result.reduce((acc, item) => {
        acc[item.aksi] = (acc[item.aksi] || 0) + 1;
        return acc;
      }, {});

      const rekap = {
        total: result.length,
        aksi: rekapByAksi,
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
 * Get riwayat audit by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await RiwayatAudit.query()
      .findById(id)
      .withGraphFetched("[formasi, usulan, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]");

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
      .withGraphFetched("[formasi, usulan, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]")
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

    const result = await RiwayatAudit.query()
      .where("formasi_id", formasi_id)
      .withGraphFetched("[formasi, usulan, dibuatOleh(simpleSelect), diperbaruiOleh(simpleSelect)]")
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

