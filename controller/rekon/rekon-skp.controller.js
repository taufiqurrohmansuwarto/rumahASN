const RekonSKP = require("@/models/rekon/skp.model");
const fs = require("fs");
import paparse from "papaparse";
const path = require("path");

const parseCSV = (filePath) => {
  const file = fs.readFileSync(filePath, "utf8");
  return paparse.parse(file, {
    header: true,
    skipEmptyLines: true,
    delimiter: ",",
  }).data;
};

const getFilePath = (filename) => path.join(process.cwd(), `docs/${filename}`);

export const syncSKPSIASN = async (req, res) => {
  try {
    const knex = RekonSKP.knex();
    const data = parseCSV(getFilePath("siasn/skp.csv"));

    await knex("rekon.skp").delete();
    await knex.batchInsert("rekon.skp", data);

    res.json({ success: true, message: "Data berhasil disinkronisasi" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRekonSKP = async (req, res) => {
  try {
    const data = await RekonSKP.query().select("*");
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
