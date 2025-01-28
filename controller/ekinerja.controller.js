import { orderBy } from "lodash";

const Pegawai = require("@/models/sync-pegawai.model");
const { cariPegawaiAtasan } = require("@/utils/query-utils");

function sortBySkpdIdSimilarity(data, targetSkpdId) {
  // Fungsi untuk menghasilkan daftar kemiripan dengan memotong 2 huruf dari belakang
  const generateSkpdVariants = (skpdId) => {
    const variants = [];
    let currentSkpd = skpdId;
    while (currentSkpd.length > 0) {
      variants.push(currentSkpd);
      currentSkpd = currentSkpd.slice(0, -2); // Potong 2 karakter terakhir
    }
    return variants;
  };

  // Buat daftar skpd_id yang mirip dengan target
  const skpdVariants = generateSkpdVariants(targetSkpdId);

  // Fungsi untuk menghitung skor kemiripan
  const calculateSimilarityScore = (skpdId) => {
    const index = skpdVariants.indexOf(skpdId);
    return index !== -1 ? index : skpdVariants.length;
  };

  // Urutkan data berdasarkan skor kemiripan (semakin rendah, semakin mirip)
  return orderBy(
    data,
    [(item) => calculateSimilarityScore(item.skpd_id)], // Urutkan berdasarkan skor kemiripan
    ["asc"] // Urutan menaik
  );
}

const cariAtasan = async (nip, search) => {
  try {
    const pegawai = await Pegawai.query()
      .where("nip_master", nip)
      .first()
      .select("skpd_id");

    const atasan = await cariPegawaiAtasan(search, pegawai?.skpd_id);

    const sortedAtasan = sortBySkpdIdSimilarity(atasan, pegawai?.skpd_id);

    return sortedAtasan;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const cariAtasanKinerja = async (req, res) => {
  try {
    const { employee_number } = req?.user;
    const { search } = req?.query;
    console.log({ employee_number, search });

    const atasan = await cariAtasan(employee_number, search);

    res.json(atasan);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const cariAtasanKinerjaByNip = async (req, res) => {
  try {
    const { nip, search } = req?.query;

    const atasan = await cariAtasan(nip, search);

    res.json(atasan);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
