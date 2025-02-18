import { dataUtama } from "@/utils/siasn-utils";
import { ConsoleSqlOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { toUpper, trim } from "lodash";
import { raw } from "objection";
const RekonJFT = require("@/models/rekon/jft.model");
const RekonUnor = require("@/models/rekon/unor.model");
const UnorSIASN = require("@/models/ref-siasn-unor.model");
const UnorSimaster = require("@/models/sync-unor-master.model");

// Fungsi untuk memformat hierarki unor
const formatUnorHierarchy = (data) => {
  if (!data) return "";
  const formattedData = trim(data.split("-").reverse().join(" - "));
  return toUpper(formattedData.replace(/^-|-$/g, ""));
};

// Fungsi untuk mendapatkan hierarki unor
const getUnorHierarchy = async (
  model,
  id,
  { idField, hierarchyFunction, system }
) => {
  try {
    if (!id) return "";

    const result = await model
      .query()
      .where(idField, id)
      .select(raw(hierarchyFunction))
      .first();

    return result?.data ? formatUnorHierarchy(result.data) : "";
  } catch (error) {
    console.error(`Error saat mengambil data unor ${system}:`, error);
    return "";
  }
};

// Fungsi untuk menampilkan unor Simaster
const getUnorSimaster = (id) =>
  getUnorHierarchy(UnorSimaster, id, {
    idField: "id",
    hierarchyFunction: "get_hierarchy_simaster(id) as data",
    system: "Simaster",
  });

// Fungsi untuk menampilkan unor SIASN
const getUnorSiasn = (id) =>
  getUnorHierarchy(UnorSIASN, id, {
    idField: "Id",
    hierarchyFunction: `get_hierarchy_siasn('${id}') as data`,
    system: "SIASN",
  });

// Fungsi untuk mengecek disparitas kinerja
const checkKinerjaDisparitas = (skpMaster, skpSiasn) => {
  const tahunKemarin = dayjs().subtract(1, "year").format("YYYY");

  const filterKinerja = (data, type) => {
    return data?.find((item) => {
      const tahun = parseInt(item?.tahun);

      if (type === "SIMASTER") {
        return tahun === parseInt(tahunKemarin) && item?.aktif === "Y";
      } else {
        return tahun === parseInt(tahunKemarin);
      }
    });
  };

  const kinerjaMaster = filterKinerja(skpMaster, "SIMASTER");
  const kinerjaSiasn = filterKinerja(skpSiasn, "SIASN");

  const sudahSemuaTahun2024 =
    parseInt(kinerjaMaster?.tahun) === 2024 &&
    parseInt(kinerjaSiasn?.tahun) === 2024;

  return {
    jenis: "skp",
    deskripsi: `SKP ${tahunKemarin}`,
    simaster: kinerjaMaster?.tahun,
    siasn: kinerjaSiasn?.tahun,
    result: sudahSemuaTahun2024 ? "Benar" : "Salah",
  };
};

// Fungsi untuk mengecek rekon unor
const checkUnorRekon = async (simaster, siasn) => {
  const idMaster = simaster?.skpd?.id;
  const idSiasn = siasn?.unorId;

  const checkUnorMaster = await RekonUnor.query()
    .where({ id_simaster: idMaster })
    .select("id_siasn")
    .first();

  let status = "";
  if (!checkUnorMaster) {
    status = "Belum direkon";
  } else if (checkUnorMaster?.id_siasn === idSiasn) {
    status = "Benar";
  } else {
    status = "Salah";
  }

  const [unorMaster, unorSiasn] = await Promise.all([
    getUnorSimaster(idMaster),
    getUnorSiasn(idSiasn),
  ]);

  return {
    jenis: "unor",
    deskripsi: "Kesamaan Unor",
    simaster: unorMaster,
    siasn: unorSiasn,
    result: status,
  };
};

// Fungsi untuk mendapatkan data utama
const fetchDataUtama = async (fetcherMaster, fetcherSIASN, nip) => {
  try {
    const [dataUtamaMaster, rwSkpMaster] = await Promise.all([
      fetcherMaster.get(
        `/master-ws/operator/employees/${nip}/data-utama-master`
      ),
      fetcherMaster.get(`/master-ws/operator/employees/${nip}/rw-skp`),
    ]);

    const [siasn, rwSkp22] = await Promise.all([
      dataUtama(fetcherSIASN, nip),
      fetcherSIASN.get(`/pns/rw-skp22/${nip}`),
    ]);

    return {
      simaster: {
        data: dataUtamaMaster?.data,
        kinerja: rwSkpMaster?.data,
      },
      siasn: {
        data: siasn,
        kinerja: rwSkp22?.data?.data,
      },
    };
  } catch (error) {
    console.error("Error fetching data utama:", error);
    return null;
  }
};

// Controller untuk mendapatkan disparitas
export const getDisparitas = async (req, res) => {
  try {
    const { employee_number } = req?.user;
    const { fetcher: fetcherMaster, siasnRequest: fetcherSIASN } = req;

    const data = await fetchDataUtama(
      fetcherMaster,
      fetcherSIASN,
      employee_number
    );
    if (!data) return res.json([]);

    const [disparitasSKP, disparitasUnor] = await Promise.all([
      checkKinerjaDisparitas(data?.simaster?.kinerja, data?.siasn?.kinerja),
      checkUnorRekon(data?.simaster?.data, data?.siasn?.data),
    ]);

    res.json([disparitasSKP, disparitasUnor]);
  } catch (error) {
    console.error("Error in getDisparitas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller untuk mendapatkan disparitas berdasarkan NIP
export const getDisparitasByNip = async (req, res) => {
  try {
    const { nip: employeeNumber } = req?.query;
    const { fetcher: fetcherMaster, siasnRequest: fetcherSIASN } = req;

    const data = await fetchDataUtama(
      fetcherMaster,
      fetcherSIASN,
      employeeNumber
    );

    const [disparitasSKP, disparitasUnor] = await Promise.all([
      checkKinerjaDisparitas(data?.simaster?.kinerja, data?.siasn?.kinerja),
      checkUnorRekon(data?.simaster?.data, data?.siasn?.data),
    ]);

    res.json([disparitasSKP, disparitasUnor]);
  } catch (error) {
    console.error("Error in getDisparitasByNip:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
