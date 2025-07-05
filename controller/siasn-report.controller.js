const siasnIPASN = require("@/models/siasn-ipasn.model");
const siasnEmployees = require("@/models/siasn-employees.model");
const xlsx = require("xlsx");
const Jft = require("@/models/ref_siasn/jft.model");
const Papa = require("papaparse");
const { convertToExcel } = require("@/utils/micorservices-utils");

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

const showEmployees = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const search = req.query.search || "";

    // Handle Excel download dengan streaming
    if (limit === -1 || limit === "all" || limit === "-1") {
      console.time("showEmployees");
      const result = await siasnEmployees.query();
      console.timeEnd("showEmployees");
      const payload = {
        data: result,
        options: {
          filename: "data-pegawai-siasn.xlsx",
          sheet_name: "data-pegawai-siasn",
          headers: null,
        },
      };

      const excel = await convertToExcel(payload);

      // Konversi ArrayBuffer ke Buffer untuk Node.js
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
      return;
    } else {
      // Handle regular pagination
      const result = await siasnEmployees
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
    }
  } catch (error) {
    console.log(error);
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
