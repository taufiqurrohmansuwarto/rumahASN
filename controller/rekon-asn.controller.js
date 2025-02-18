const RekonJFT = require("@/models/rekon/jft.model");
const RekonUnor = require("@/models/rekon/unor.model");
const RekonJFU = require("@/models/rekon/jfu.model");
const SiasnEmployees = require("@/models/siasn-employees.model");

const findIdSiasn = async (nip) => {
  const result = await SiasnEmployees.query().where("nip_baru", nip).first();
  return result?.pns_id;
};

const cariUnorSiasn = async (unorSimasterID) => {
  const result = await RekonUnor.query()
    .where("id_simaster", unorSimasterID)
    .first();

  return result?.id_siasn;
};

const UNOR_ID = {
  instansiId: "A5EB03E23CCCF6A0E040640A040252AD",
  satuanKerjaId: "A5EB03E24213F6A0E040640A040252AD",
  instansiIndukId: "A5EB03E23CCCF6A0E040640A040252AD",
};

// 1: struktural, 2: fungsional, 3: pelaksana,

const cariKodeJabatan = async (jenisJabatan, kodeJabatanMaster) => {
  const jenisJabatanNum = Number(jenisJabatan);

  if (jenisJabatanNum === 2) {
    const result = await RekonJFT.query()
      .where("id_simaster", kodeJabatanMaster)
      .first();
    return result?.id_siasn;
  }

  if (jenisJabatanNum === 3) {
    const result = await RekonJFU.query()
      .where("id_simaster", kodeJabatanMaster)
      .first();
    return result?.id_siasn;
  }

  return null;
};

export const rekonAsn = async (req, res) => {
  try {
    const { fetcher } = req;
    const { employee_number: nip } = req.user;
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/data-utama-master`
    );
    const currentUser = result?.data;

    const skpdId = currentUser?.skpd?.id;
    const jabatanId = currentUser?.jabatan?.kode_jabatan;

    const unorSiasn = await cariUnorSiasn(skpdId);
    const kodeJabatanSiasn = await cariKodeJabatan(
      currentUser?.jabatan?.kode_jenis_jabatan,
      jabatanId
    );

    const pnsId = await findIdSiasn(nip);

    const dataJabatan = {
      ...UNOR_ID,
      nip: nip,
      pnsId: pnsId,
    };

    console.log(dataJabatan);

    res.json(currentUser);
  } catch (error) {
    console.log(error);
  }
};

export const rekonAsnByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/data-utama-master`
    );

    res.json(result?.data);
  } catch (error) {
    console.log(error);
  }
};
