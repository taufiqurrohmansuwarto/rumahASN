const { pasangan, anak, orangTua } = require("@/utils/siasn-utils");

const daftarPasangan = async (req, res) => {
  try {
    const { siasnRequest } = req;
    const { employee_number: nip } = req?.user;

    const hasilPasangan = await pasangan(siasnRequest, nip);

    res.json(hasilPasangan?.data?.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const daftarAnak = async (req, res) => {
  try {
    const { siasnRequest } = req;
    const { employee_number: nip } = req?.user;

    const hasilPasangan = await anak(siasnRequest, nip);

    res.json(hasilPasangan?.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const daftarOrtu = async (req, res) => {
  try {
    const { siasnRequest } = req;
    const { employee_number: nip } = req?.user;

    const hasilPasangan = await orangTua(siasnRequest, nip);
    const data = hasilPasangan?.data?.data;

    const hasil = [
      {
        id: 2,
        hubungan: "ayah",
        nama: data?.ayah?.nama || "-",
        tempatLahir: data?.ayah?.tempatLahir || "-",
        jenisKelamin: data?.ayah?.jenisKelamin || "-",
        tglLahir: data?.ayah?.tglLahir || "-",
      },
      {
        id: 1,
        hubungan: "ibu",
        nama: data?.ibu?.nama || "-",
        tempatLahir: data?.ibu?.tempatLahir || "-",
        jenisKelamin: data?.ibu?.jenisKelamin || "-",
        tglLahir: data?.ibu?.tglLahir || "-",
      },
    ];

    res.json(hasil);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const daftarPasanganByNip = async (req, res) => {};
const daftarAnakByNip = async (req, res) => {};
const daftarOrtuByNip = async (req, res) => {};

module.exports = {
  daftarPasangan,
  daftarAnak,
  daftarOrtu,
  daftarPasanganByNip,
  daftarAnakByNip,
  daftarOrtuByNip,
};
