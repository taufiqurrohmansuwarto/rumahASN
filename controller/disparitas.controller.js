import { dataUtama } from "@/utils/siasn-utils";
import dayjs from "dayjs";
import { toUpper, trim, upperCase } from "lodash";
import { raw } from "objection";
const RekonJFT = require("@/models/rekon/jft.model");
const RekonUnor = require("@/models/rekon/unor.model");

const UnorSIASN = require("@/models/ref-siasn-unor.model");
const UnorSimaster = require("@/models/sync-unor-master.model");

const formatUnorHierarchy = (data) => {
  if (!data) return "";
  const formattedData = trim(data.split("-").reverse().join(" - "));
  const hasil = toUpper(formattedData.replace(/^-|-$/g, ""));
  return hasil;
};

const getUnorHierarchy = async (model, id, queryOptions) => {
  try {
    if (!id) return "";

    const result = await model
      .query()
      .where(queryOptions.idField, id)
      .select(raw(queryOptions.hierarchyFunction))
      .first();

    if (!result?.data) return "";

    const hasil = formatUnorHierarchy(result.data);

    return hasil;
  } catch (error) {
    console.error(
      `Error saat mengambil data unor ${queryOptions.system}:`,
      error
    );
    return "";
  }
};

const showUnorSimaster = async (id) => {
  return getUnorHierarchy(UnorSimaster, id, {
    idField: "id",
    hierarchyFunction: "get_hierarchy_simaster(id) as data",
    system: "Simaster",
  });
};

const showUnorSiasn = async (id) => {
  return getUnorHierarchy(UnorSIASN, id, {
    idField: "Id",
    hierarchyFunction: `get_hierarchy_siasn('${id}') as data`,
    system: "SIASN",
  });
};

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
  const result = simaster && siasn ? "Benar" : "Salah";

  return {
    jenis: "skp",
    deskripsi: `SKP ${tahunKemarin} dan ${duaTahunKemarin}`,
    simaster: kinerjaMaster?.map((item) => item?.tahun).join(", "),
    siasn: kinerjaSiasn?.map((item) => item?.tahun).join(", "),
    result,
  };
};

const rekonUnor = async (simaster, siasn) => {
  const idMaster = simaster?.skpd?.id;
  const idSiasn = siasn?.unorId;

  let status = "";

  const checkUnorMaster = await RekonUnor.query()
    .where({
      id_simaster: idMaster,
    })
    .select("id_siasn")
    .first();

  const checkSiasn = checkUnorMaster?.id_siasn === idSiasn;

  if (!checkUnorMaster) {
    status = "Belum direkon";
  } else if (checkSiasn) {
    status = "Benar";
  } else if (!checkSiasn) {
    status = "Salah";
  }

  const unorMaster = await showUnorSimaster(idMaster);
  const unorSiasn = await showUnorSiasn(idSiasn);

  return {
    jenis: "unor",
    deskripsi: `Kesamaan Unor`,
    simaster: unorMaster,
    siasn: unorSiasn,
    result: status,
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

    if (!data) return res.json([]);

    const disparitasSKP = disparitasKinerja(
      data?.simaster?.kinerja,
      data?.siasn?.kinerja
    );

    const disparitasUnor = await rekonUnor(
      data?.simaster?.data,
      data?.siasn?.data
    );

    const disparitas = [disparitasSKP, disparitasUnor];

    res.json(disparitas);
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
