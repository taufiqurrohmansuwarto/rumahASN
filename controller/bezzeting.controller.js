const fs = require("fs");
const path = require("path");
const paparse = require("papaparse");
import { handleError } from "@/utils/helper/controller-helper";
import { trim } from "lodash";

// jabatan fungsional
const BezzetingJf = require("@/models/bezzeting-jf.model");

const parseCSV = (filePath) => {
  const file = fs.readFileSync(filePath, "utf8");
  return paparse.parse(file, {
    header: true,
    skipEmptyLines: true,
    delimiter: ";",
  }).data;
};

const getFilePath = (filename) =>
  path.join(process.cwd(), `docs/siasn/${filename}`);

export const syncBezzetingJf = async (req, res) => {
  try {
    const data = parseCSV(getFilePath("data-rekom.csv"));
    //     hapus kalau ada \n
    const result = data.map((item) => {
      return {
        ...item,
        jf_id: trim(item.jf_id.replace(/\n/g, "")),
      };
    });
    const knex = BezzetingJf.knex();
    await knex("bezzeting_jf").delete();
    await knex.batchInsert("bezzeting_jf", result);
    res.status(200).json({
      message: "Data berhasil disinkronisasi",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getBezzetingJf = async (req, res) => {
  try {
    const knex = BezzetingJf.knex();
    const hasil = await knex.raw(`WITH rekom_summary AS (SELECT jf_id,
                              SUM(rekom) AS total_rekom
                       FROM public.bezzeting_jf
                       WHERE jf_id IS NOT NULL
                         AND jf_id <> ''
                       GROUP BY jf_id)
SELECT rs.jf_id,
       MAX(rjft.nama)                        AS nama_jabatan,
       rs.total_rekom                        AS rekom,
       COUNT(se.jabatan_id)                  AS bezzeting,
       COUNT(se.jabatan_id) - rs.total_rekom AS status
FROM rekom_summary rs
         LEFT JOIN
     public.siasn_employees se ON rs.jf_id = se.jabatan_id
         LEFT JOIN
     ref_siasn.jft rjft ON rjft.id = rs.jf_id
GROUP BY rs.jf_id, rs.total_rekom
ORDER BY rs.jf_id;`);
    res.status(200).json(hasil?.rows);
  } catch (error) {
    handleError(res, error);
  }
};
