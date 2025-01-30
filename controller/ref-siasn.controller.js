const fs = require("fs");
import paparse from "papaparse";
const currentDirectory = process.cwd();
const path = require("path");

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
