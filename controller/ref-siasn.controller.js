const fs = require("fs");
import paparse from "papaparse";
const currentDirectory = process.cwd();
const path = require("path");

const PendidikanModel = require("@/models/ref_siasn/pendidikan.model");

export const refPangkatSiasn = async (req, res) => {
  try {
    const filePath = path.join(
      currentDirectory,
      "docs/siasn/siasn_golongan.csv"
    );
    const file = fs.readFileSync(filePath, "utf8");

    const result = paparse.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ",",
    });
    const data = result.data;

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const refJabatanPelaksanaSiasn = async (req, res) => {
  try {
    const filePath = path.join(
      currentDirectory,
      "docs/siasn/siasn_jab_pelaksana.csv"
    );
    const file = fs.readFileSync(filePath, "utf8");

    const result = paparse.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
    });
    const data = result.data;
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const syncPendidikan = async (req, res) => {
  try {
    const filePath = path.join(currentDirectory, "docs/siasn/pendidikan.csv");

    const knex = PendidikanModel.knex();

    const file = fs.readFileSync(filePath, "utf8");

    const result = paparse.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
    });

    const data = result?.data;
    await knex.delete().from(PendidikanModel.tableName);
    await knex.batchInsert(PendidikanModel.tableName, data);

    res.json({
      message: "Pendidikan berhasil disinkronisasi",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const findPendidikan = async (req, res) => {
  try {
    const { tk_pendidikan_id, pendidikan_id, nama } = req?.query;
    console.log(req?.query);
    const result = await PendidikanModel.query()
      .where((builder) => {
        if (pendidikan_id) {
          builder.where("id", pendidikan_id);
        }
        if (tk_pendidikan_id) {
          builder.where("tk_pendidikan_id", tk_pendidikan_id);
        }
        if (nama) {
          builder.where("nama", "ilike", `%${nama}%`);
        }
      })
      .select("*", "id as value", "nama as label");

    console.log(result?.length);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const syncRumpunJabatan = async (req, res) => {
  try {
  } catch (error) {
    handleError(error, res);
  }
};
