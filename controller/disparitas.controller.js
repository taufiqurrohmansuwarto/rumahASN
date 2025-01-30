import { dataUtama } from "@/utils/siasn-utils";
import dayjs from "dayjs";
const RekonJFT = require("@/models/rekon/jft.model");
const RekonUnor = require("@/models/rekon/unor.model");

// disparitas kinerja
/**
 *
 * @param {*} simaster
 * @param {*} siasn
 *
 */

const disparitasKinerja = (skpMaster, skpSiasn) => {
  // tahun sekarang dengan format YYYY
  const tahunKemarin = dayjs().subtract(1, "year").format("YYYY");
  const duaTahunKemarin = dayjs().subtract(2, "year").format("YYYY");

  // filter data kinerja 2 tahun terakhir dari simaster
  const kinerjaMaster = skpMaster?.filter((item) => {
    const tahun = parseInt(item?.tahun);
    return (
      tahun === parseInt(tahunKemarin) || tahun === parseInt(duaTahunKemarin)
    );
  });

  // filter data kinerja 2 tahun terakhir dari siasn
  const kinerjaSiasn = skpSiasn?.filter((item) => {
    const tahun = parseInt(item?.tahun);
    return (
      tahun === parseInt(tahunKemarin) || tahun === parseInt(duaTahunKemarin)
    );
  });

  // cek apakah data lengkap (2 tahun)
  const simaster = kinerjaMaster?.length === 2;
  const siasn = kinerjaSiasn?.length === 2;

  // hasil akhir - true jika data lengkap di kedua sistem
  const result = simaster && siasn;

  return {
    jenis: "skp",
    deskripsi: `SKP ${tahunKemarin} dan ${duaTahunKemarin} pada aplikasi SIASN dan SIMASTER`,
    simaster,
    siasn,
    result,
  };
};

const rekonUnor = async (simaster, siasn) => {
  const unorMaster = simaster?.skpd?.id;
  const unorSiasn = siasn?.unorId;

  const checkUnorMaster = await RekonUnor.query()
    .where({
      id_simaster: unorMaster,
    })
    .select("id_siasn")
    .first();

  const checkSiasn = checkUnorMaster?.id_siasn === unorSiasn;

  return {
    jenis: "unor",
    deskripsi: `Unor SIASN dan SIMASTER`,
    simaster: true,
    siasn: checkSiasn,
    result: checkSiasn,
  };
};

const rekonUnorJabatan = (simaster, siasn) => {};

/**
 *
 * @param {*} nip
 * disparitas data meliputi
 * 1. SKP 2 tahun terakhir
 * 2. Jabatan
 * 3. Unit Organisasi
 * 4. Nama, NIP, dan Tanggal Lahir
 * 5. Pangkat
 * 6. Masa Kerja
 *
 * attribut object jenis, keterangan
 */
const getDataUtama = async (fetcherMaster, fetcherSIASN, nip) => {
  try {
    const dataUtamaMaster = await fetcherMaster.get(
      `/master-ws/operator/employees/${nip}/data-utama-master`
    );

    const simaster = dataUtamaMaster?.data;
    const rwSkpMaster = await fetcherMaster.get(
      `/master-ws/operator/employees/${nip}/rw-skp`
    );

    const kinerjaMaster = rwSkpMaster?.data;

    const siasn = await dataUtama(fetcherSIASN, nip);
    const rwSkp22 = await fetcherSIASN.get(`/pns/rw-skp22/${nip}`);
    const kinerjaSiasn = rwSkp22?.data?.data;

    return {
      simaster: {
        data: simaster,
        kinerja: kinerjaMaster,
      },
      siasn: {
        data: siasn,
        kinerja: kinerjaSiasn,
      },
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getDisparitas = async (req, res) => {
  try {
    const { employee_number } = req?.user;
    const { fetcher: fetcherMaster, siasnRequest: fetcherSIASN } = req;

    const data = await getDataUtama(
      fetcherMaster,
      fetcherSIASN,
      employee_number
    );

    const disparitasSKP = disparitasKinerja(
      data?.simaster?.kinerja,
      data?.siasn?.kinerja
    );

    const disparitasUnor = await rekonUnor(
      data?.simaster?.data,
      data?.siasn?.data
    );
    console.log(disparitasUnor);

    const disparitas = [disparitasSKP];

    res.json({ data, disparitas });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getDisparitasByNip = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
