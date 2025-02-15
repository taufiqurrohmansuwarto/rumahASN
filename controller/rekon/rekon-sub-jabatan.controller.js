import fs from "fs";
import path from "path";
import paparse from "papaparse";
import SubJabatanSiasn from "@/models/ref_siasn/sub-jabatan.model";

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

export const syncSubJabatanSiasn = async (req, res) => {
  try {
    const knex = SubJabatanSiasn.knex();
    const data = parseCSV(getFilePath("siasn/subjabatan_siasn.csv"));

    await knex("ref_siasn.sub_jabatan").delete();
    await knex.batchInsert("ref_siasn.sub_jabatan", data);

    res.json({ success: true, message: "Data berhasil disinkronisasi" });
  } catch (error) {
    handleError(res, error);
  }
};

export const refSubJabatanSiasn = async (req, res) => {
  try {
    const knex = SubJabatanSiasn.knex();
    const data = await knex("ref_siasn.sub_jabatan").select("*").orderBy("id");
    console.log(data);

    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};
