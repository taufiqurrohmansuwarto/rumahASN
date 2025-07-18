const fs = require("fs");
import paparse from "papaparse";
const currentDirectory = process.cwd();
const path = require("path");

const PendidikanModel = require("@/models/ref_siasn/pendidikan.model");
const RumpunJabatanJfModel = require("@/models/ref_siasn/rumpun-jabatan-jf.model");
const LembagaSertifikasiModel = require("@/models/ref_siasn/lembaga-sertifikasi.model");
const RumpunJabatanModel = require("@/models/ref_siasn/rumpun-jabatan.model");

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

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const syncRumpunJabatanJf = async (req, res) => {
  try {
    const knex = RumpunJabatanJfModel.knex();
    const filePath = path.join(
      currentDirectory,
      "docs/siasn/ref-rumpun-jabatan.csv"
    );
    const file = fs.readFileSync(filePath, "utf8");
    const result = paparse.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ",",
    });

    const data = result?.data;
    await knex.delete().from(RumpunJabatanJfModel.tableName);
    await knex.batchInsert(RumpunJabatanJfModel.tableName, data);

    res.json({
      message: "Rumpun jabatan jf berhasil disinkronisasi",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const syncLembagaSertifikasi = async (req, res) => {
  try {
    const knex = LembagaSertifikasiModel.knex();
    const filePath = path.join(
      currentDirectory,
      "docs/siasn/ref-lembaga-sertifikasi.csv"
    );
    const file = fs.readFileSync(filePath, "utf8");
    const result = paparse.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ",",
    });

    const data = result?.data;
    await knex.delete().from(LembagaSertifikasiModel.tableName);
    await knex.batchInsert(LembagaSertifikasiModel.tableName, data);

    res.json({
      message: "Lembaga sertifikasi berhasil disinkronisasi",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const findLembagaSertifikasi = async (req, res) => {
  try {
    const result = await LembagaSertifikasiModel.query().select(
      "*",
      "id as value",
      "nama as label"
    );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const findRumpunJabatanJf = async (req, res) => {
  try {
    const result = await RumpunJabatanJfModel.query().select(
      "*",
      "id as value",
      "nama as label"
    );

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
    const knex = RumpunJabatanModel.knex();
    const filePath = path.join(
      currentDirectory,
      "docs/siasn/rumpun-jabatan.csv"
    );
    const file = fs.readFileSync(filePath, "utf8");
    const result = paparse.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ",",
    });

    const data = result?.data;
    await knex.delete().from(RumpunJabatanModel.tableName);
    await knex.batchInsert(RumpunJabatanModel.tableName, data);

    res.json({
      message: "Rumpun jabatan berhasil disinkronisasi",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const findRumpunJabatan = async (req, res) => {
  try {
    const result = await RumpunJabatanModel.query().select(
      "*",
      "cepat_kode as id",
      "cepat_kode as value",
      "nama as label"
    );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
