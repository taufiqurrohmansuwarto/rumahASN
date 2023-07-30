import moment from "moment";
const { orderBy } = require("lodash");

const url = "https://master.bkd.jatimprov.go.id/files_jatimprov/";

const serializeRwJabatanMaster = (data) => {
  const jabatanStruktural = data?.jabatan_struktural;
  const jabatanFungsional = data?.jabatan_fungsional_tertentu;
  const jabatanPelaksana = data?.jabatan_pelaksana;

  const rwytJabatanStruktural = jabatanStruktural?.map((strutkural) => ({
    id: `struktural_${strutkural?.struktural_id}`,
    jenis_jabatan: "Struktural",
    jabatan: strutkural?.jabatan_struktural?.jab_struktural,
    unor: `${strutkural?.instansi} - ${strutkural?.unit_kerja}`,
    tmt_jabatan: moment(strutkural?.tmt_jab).format("DD-MM-YYYY"),
    tgl_sk: moment(strutkural?.tgl_sk).format("DD-MM-YYYY"),
    nomor_sk: strutkural?.no_sk,
    aktif: strutkural?.aktif,
    file: `${url}${strutkural?.file_struktural}`,
  }));

  const rwytJabatanPelaksana = jabatanPelaksana?.map((strutkural) => ({
    id: `pelaksana_${strutkural?.pelaksana_id}`,
    jenis_jabatan: "Pelaksana",
    jabatan: strutkural?.jfu?.name,
    unor: `${strutkural?.instansi} - ${strutkural?.unit_kerja}`,
    tmt_jabatan: moment(strutkural?.tmt_jab).format("DD-MM-YYYY"),
    tgl_sk: moment(strutkural?.tgl_sk).format("DD-MM-YYYY"),
    nomor_sk: strutkural?.no_sk,
    aktif: strutkural?.aktif,
    file: `${url}${strutkural?.file_jfu}`,
  }));

  const rwytJabatanFungsional = jabatanFungsional?.map((strutkural) => ({
    id: `fungsional_${strutkural?.fungsional_id}`,
    jenis_jabatan: "Fungsional",
    jabatan: `${strutkural?.jft?.name} ${strutkural?.jft?.jenjang_jab}`,
    unor: `${strutkural?.instansi} - ${strutkural?.unit_kerja}`,
    tmt_jabatan: moment(strutkural?.tmt_jab).format("DD-MM-YYYY"),
    tgl_sk: moment(strutkural?.tgl_sk).format("DD-MM-YYYY"),
    nomor_sk: strutkural?.no_sk,
    aktif: strutkural?.aktif,
    file: `${url}${strutkural?.file_jft}`,
  }));

  if (data) {
    return [
      ...rwytJabatanFungsional,
      ...rwytJabatanPelaksana,
      ...rwytJabatanStruktural,
    ];
  } else {
    return null;
  }
};

export const rwJabatanMaster = async (req, res) => {
  try {
    const { fetcher } = req;
    const { employee_number: nip } = req.user;
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-jabatan`
    );

    const hasilku = serializeRwJabatanMaster(result?.data);

    if (hasilku?.length) {
      const sorting = orderBy(
        hasilku,
        [
          (obj) => {
            const [day, month, year] = obj?.tmt_jabatan.split("-");
            return new Date(year, month - 1, day);
          },
        ],
        ["asc"]
      );

      res.json(sorting);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const rwAngkakreditMaster = async (req, res) => {
  try {
    const { fetcher } = req;
    const { employee_number: nip } = req.user;

    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-angkakredit`
    );
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const rwSkpMaster = async (req, res) => {
  try {
    const { fetcher } = req;
    const { employee_number: nip } = req.user;
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-skp`
    );
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const dataUtamaMaster = async (req, res) => {
  try {
    const { fetcher } = req;
    const { employee_number: nip } = req.user;
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/data-utama-master`
    );
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  rwJabatanMaster,
  rwAngkakreditMaster,
  rwSkpMaster,
  dataUtamaMaster,
};
