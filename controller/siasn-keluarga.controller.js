const {
  pasangan,
  anak,
  orangTua,
  tambahPasangan,
} = require("@/utils/siasn-utils");
const DataSIASN = require("@/models/siasn-employees.model");
const { handleError } = require("@/utils/helper/controller-helper");
const metanip = "199303302019032011";

const serializePasangan = (pasangan) => {
  return pasangan?.map((item) => {
    const { orang, dataPernikahan } = item;
    return {
      statusNikah: item?.statusNikah,
      ...orang,
      ...dataPernikahan,
    };
  });
};

const daftarPasangan = async (req, res) => {
  try {
    const { siasnRequest } = req;
    const { employee_number: nip } = req?.user;

    const hasilPasangan = await pasangan(siasnRequest, nip);
    const currentPasangan = hasilPasangan?.data?.data?.listPasangan;
    const serializedPasangan = serializePasangan(currentPasangan);

    if (serializedPasangan?.length > 0) {
      res.json(serializedPasangan);
    } else {
      res.json([]);
    }
  } catch (error) {
    handleError(res, error);
  }
};

const daftarPasanganByNip = async (req, res) => {
  try {
    const { siasnRequest: request, fetcher } = req;
    const { nip } = req?.query;

    const hasilPasangan = await pasangan(request, nip);
    const currentPasangan = hasilPasangan?.data?.data?.listPasangan;
    const serializedPasangan = serializePasangan(currentPasangan);

    if (serializedPasangan?.length > 0) {
      res.json(serializedPasangan);
    } else {
      res.json([]);
    }
  } catch (error) {
    handleError(res, error);
  }
};

const tambahPasanganSIASN = async (req, res) => {
  try {
    const { siasnRequest } = req;
    const { employee_number: nip } = req?.user;

    const body = req?.body;

    const pegawaiId = await DataSIASN.query()
      .where("nip_baru", metanip)
      .first();

    if (!pegawaiId) {
      res.status(404).json({ message: "Pegawai tidak ditemukan" });
    } else {
      const pnsOrangId = pegawaiId?.pns_id;
      const payload = {
        pnsOrangId,
        statusPekerjaanPasangan: "0",
        nama: "123",
        orangId: "7E85A2746583BD8DE050640A3C036B36",
        jenisIdentitas: "123",
        nomorIdentitas: "123",
        agamaId: "1",
        statusHidup: "1",
        ...body,
      };

      console.log(payload);

      const result = await tambahPasangan(siasnRequest, payload);
      console.log(result);

      res.json({ message: "Success" });
    }
  } catch (error) {
    console.error(error);
    const errorMessage = error?.message;
    console.log(errorMessage);
    res.status(500).json({ message: errorMessage });
  }
};

const daftarAnak = async (req, res) => {
  try {
    const { siasnRequest } = req;
    const { employee_number: nip } = req?.user;

    const hasilPasangan = await anak(siasnRequest, nip);
    const result = hasilPasangan?.listAnak;

    res.json(result);
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

const daftarAnakByNip = async (req, res) => {};
const daftarOrtuByNip = async (req, res) => {};

module.exports = {
  daftarPasangan,
  daftarAnak,
  daftarOrtu,
  daftarPasanganByNip,
  daftarAnakByNip,
  daftarOrtuByNip,
  tambahPasanganSIASN,
};
