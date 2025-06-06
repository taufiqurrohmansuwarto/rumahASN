const fs = require("fs");
import paparse from "papaparse";
const path = require("path");
const arrayToTree = require("array-to-tree");
const JfuSiasn = require("@/models/ref_siasn/jfu.model");
const JfuSimaster = require("@/models/ref_simaster/jfu.model");
const RekonJfu = require("@/models/rekon/jfu.model");

// Helper functions
const parseCSV = (filePath) => {
  const file = fs.readFileSync(filePath, "utf8");
  return paparse.parse(file, {
    header: true,
    skipEmptyLines: true,
    delimiter: ",",
  }).data;
};

const handleError = (res, error) => {
  console.log(error);
  res.status(500).json({ message: "Internal server error" });
};

const getFilePath = (filename) => path.join(process.cwd(), `docs/${filename}`);

// Controller functions
export const syncJenjangSiasn = async (req, res) => {
  try {
    const knex = JfuSiasn.knex();
    const data = parseCSV(getFilePath("siasn/jabatan_pelaksana.csv"));

    await knex("ref_siasn.jfu").delete();
    await knex.batchInsert("ref_siasn.jfu", data);

    res.json({ success: true, message: "Data berhasil disinkronisasi" });
  } catch (error) {
    handleError(res, error);
  }
};

export const syncJenjangSimaster = async (req, res) => {
  try {
    const knex = JfuSimaster.knex();
    const data = parseCSV(getFilePath("simaster/ref_jabatan_pelaksana.csv"));

    await knex("ref_simaster.jfu").delete();
    await knex.batchInsert("ref_simaster.jfu", data);

    res.json({ success: true, message: "Data berhasil disinkronisasi" });
  } catch (error) {
    handleError(res, error);
  }
};

export const refJenjangSiasn = async (req, res) => {
  try {
    const hasil = await JfuSiasn.query().where("status", "1");
    res.json(hasil);
  } catch (error) {
    handleError(res, error);
  }
};

export const refJenjangSimaster = async (req, res) => {
  try {
    const hasil = await JfuSimaster.query().select(
      "id",
      "pId",
      "name",
      "name as label",
      "name as title",
      "id as value"
    );
    const tree = arrayToTree(hasil, {
      childrenProperty: "children",
      parentProperty: "pId",
      customID: "id",
    });
    res.json(tree);
  } catch (error) {
    handleError(res, error);
  }
};

export const getRekonJenjang = async (req, res) => {
  try {
    const { master_id } = req?.query;
    const result = await RekonJfu.query()

      .withGraphFetched("[JfuSiasn,JfuSimaster]")
      .where("id_simaster", master_id)
      .select("id", "id_siasn", "id_simaster");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const postRekonJenjang = async (req, res) => {
  try {
    const payload = req?.body;

    const { custom_id: customId } = req?.user;

    const check = await RekonJfu.query()
      .where("id_siasn", payload?.id_siasn)
      .andWhere("id_simaster", payload?.id_simaster);

    if (check?.length > 0) {
      res.json(null);
    } else {
      const result = await RekonJfu.query().insert({
        ...payload,
        user_id: customId,
      });
      res.json({
        message: "Success",
        data: result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteRekonJenjang = async (req, res) => {
  try {
    const { jenjangId } = req?.query;

    const result = await RekonJfu.query().where("id", jfuId).delete();
    console.log(result);

    res.json({
      message: "Success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
