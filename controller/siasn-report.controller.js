const siasnIPASN = require("@/models/siasn-ipasn.model");
const siasnEmployees = require("@/models/siasn-employees.model");
const xlsx = require("xlsx");
const Jft = require("@/models/ref_siasn/jft.model");
const Papa = require("papaparse");
const {
  convertToExcel,
  convertCSVToExcel,
} = require("@/utils/micorservices-utils");

const showIPASN = async (req, res) => {
  try {
    const limit = req.query.limit || 25;
    const page = req.query.page || 1;
    const search = req.query.search || "";

    const result = await siasnIPASN
      .query()
      .page(page - 1, limit)
      .where((builder) => {
        if (search) {
          builder.where("nip", "ilike", `%${search}%`);
          builder.orWhere("nama", "ilike", `%${search}%`);
        }
      });
    res.json({
      data: result.results,
      pagination: {
        total: result.total,
        limit: parseInt(limit),
        page: parseInt(page),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const uploadIPASN = async (req, res) => {
  const knex = await siasnIPASN.knex();
  try {
    const file = req?.file;

    if (!file) {
      res.status(400).json({ message: "File is required" });
    } else {
      await siasnIPASN.transaction(async (trx) => {
        const workbook = xlsx.read(file?.buffer);
        const sheet_name_list = workbook.SheetNames;
        const xlData = xlsx.utils.sheet_to_json(
          workbook.Sheets[sheet_name_list[0]]
        );
        await knex.delete().from("siasn_ipasn").transacting(trx);
        await knex.batchInsert("siasn_ipasn", xlData).transacting(trx);
        res.status(200).json({ message: "success" });
      });
      // read file from buffer
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function untuk query data pegawai
const queryEmployees = async (options = {}) => {
  const { page, limit, search } = options;

  if (page && limit) {
    // Pagination query
    return await siasnEmployees
      .query()
      .page(page - 1, limit)
      .where((builder) => {
        if (search) {
          builder.where("nip_baru", "ilike", `%${search}%`);
          builder.orWhere("nama", "ilike", `%${search}%`);
        }
      });
  } else {
    // Get all data
    const queryBuilder = siasnEmployees.query();

    if (search) {
      queryBuilder.where((builder) => {
        builder.where("nip_baru", "ilike", `%${search}%`);
        builder.orWhere("nama", "ilike", `%${search}%`);
      });
    }

    return await queryBuilder;
  }
};

// Helper function untuk download Excel
const downloadExcel = async (data, res) => {
  console.time("generateExcel");

  const payload = {
    data: data,
    options: {
      filename: "data-pegawai-siasn.xlsx",
      sheet_name: "data-pegawai-siasn",
      headers: null,
    },
  };

  const excel = await convertToExcel(payload);
  const buffer = Buffer.from(excel);

  console.timeEnd("generateExcel");

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=data-pegawai-siasn.xlsx"
  );
  res.send(buffer);
};

const downloadExcelFromCSV = async (data, res) => {
  const csv = Papa.unparse(data);
  const excel = await convertCSVToExcel(csv);
  const buffer = Buffer.from(excel);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=data-pegawai-siasn.xlsx"
  );
  res.send(buffer);
};

// Helper function untuk download CSV
const downloadCSV = async (data, res) => {
  const csv = Papa.unparse(data);
  const filename = `data-pegawai-siasn-${
    new Date().toISOString().split("T")[0]
  }.csv`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.send(csv);
};

// Helper function untuk response pagination
const sendPaginationResponse = (result, limit, page, res) => {
  res.json({
    data: result.results,
    pagination: {
      total: result.total,
      limit: parseInt(limit),
      page: parseInt(page),
    },
  });
};

// Main function
const showEmployees = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const search = req.query.search || "";
    const downloadFormat = req.query.downloadFormat || "excel";

    // Handle download (Excel/CSV)
    if (limit === -1 || limit === "all" || limit === "-1") {
      console.time("queryAllEmployees");
      const result = await queryEmployees({ search });
      console.timeEnd("queryAllEmployees");

      switch (downloadFormat) {
        case "excel":
          await downloadExcelFromCSV(result, res);
          break;
        case "csv":
          await downloadCSV(result, res);
          break;
        default:
          res.status(400).json({ message: "Invalid download format" });
      }
      return;
    }

    // Handle regular pagination
    const result = await queryEmployees({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });

    sendPaginationResponse(result, limit, page, res);
  } catch (error) {
    console.error("Error in showEmployees:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const uploadEmployees = async (req, res) => {
  const knex = await siasnEmployees.knex();
  try {
    const file = req?.file;

    if (!file) {
      res.status(400).json({ message: "File is required" });
    } else {
      await siasnIPASN.transaction(async (trx) => {
        const workbook = xlsx.read(file?.buffer);
        const sheet_name_list = workbook.SheetNames;
        const xlData = xlsx.utils.sheet_to_json(
          workbook.Sheets[sheet_name_list[0]]
        );
        await knex.delete().from("siasn_employees").transacting(trx);
        await knex.batchInsert("siasn_employees", xlData).transacting(trx);
        res.status(200).json({ message: "success" });
      });
      // read file from buffer
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const showRefJft = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const search = req.query.search || "";

    const result = await Jft.query()
      .page(page - 1, limit)
      .where((builder) => {
        if (search) {
          builder.where("nama", "ilike", `%${search}%`);
        }
      });
    res.json({
      data: result.results,
      pagination: {
        total: result.total,
        limit: parseInt(limit),
        page: parseInt(page),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const uploadRefJft = async (req, res) => {
  const knex = await Jft.knex();
  try {
    const file = req?.file;

    if (!file) {
      res.status(400).json({ message: "File is required" });
    } else {
      await siasnIPASN.transaction(async (trx) => {
        const workbook = xlsx.read(file?.buffer);
        const sheet_name_list = workbook.SheetNames;
        const xlData = xlsx.utils.sheet_to_json(
          workbook.Sheets[sheet_name_list[0]]
        );
        await knex.delete().from("ref_siasn.jft").transacting(trx);
        await knex.batchInsert("ref_siasn.jft", xlData).transacting(trx);
        res.status(200).json({ message: "success" });
      });
      // read file from buffer
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  showIPASN,
  uploadIPASN,
  showEmployees,
  uploadEmployees,
  showRefJft,
  uploadRefJft,
};
