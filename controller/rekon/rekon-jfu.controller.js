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

export const downloadRekonJfu = async (req, res) => {
  try {
    const result = await JfuSimaster.query().withGraphFetched("[rekon_jfu]");

    const data = result.map((item) => ({
      ...item,
      id_siasn: item?.rekon_jfu?.id_siasn,
    }));

    const csv = paparse.unparse(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=rekon_jfu.csv");
    res.send(csv);
  } catch (error) {
    handleError(res, error);
  }
};

// Controller functions
export const syncJabatanPelaksanaSiasn = async (req, res) => {
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

export const syncJabatanPelaksanaSimaster = async (req, res) => {
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

export const refJabatanPelaksanaSiasn = async (req, res) => {
  try {
    const hasil = await JfuSiasn.query().where("status", "1");
    res.json(hasil);
  } catch (error) {
    handleError(res, error);
  }
};

export const refJabatanPelaksanaSimaster = async (req, res) => {
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

export const getRekonJfu = async (req, res) => {
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

export const postRekonJfu = async (req, res) => {
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

export const deleteRekonJfu = async (req, res) => {
  try {
    const { jfuId } = req?.query;
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
