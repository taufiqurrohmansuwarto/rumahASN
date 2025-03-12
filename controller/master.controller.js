import {
  departmentDetail,
  employeeTodayBirthdayDetail,
  getKelengkapanDokumen,
  getRwAnak,
  getRwDiklat,
  getRwJabDokter,
  getRwJabGuru,
  getRwPangkat,
  getRwPasangan,
  getRwPendidikanMaster,
  getRwPenghargaan,
  getRwSatyaLencana,
} from "@/utils/master.utils";
import arrayToTree from "array-to-tree";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);
const { orderBy, sortBy, toString } = require("lodash");
const Anomali23 = require("@/models/anomali23.model");
const SyncPegawaiMaster = require("@/models/sync-pegawai.model");

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
    tmt_jabatan: dayjs(strutkural?.tmt_jab).format("DD-MM-YYYY"),
    tgl_sk: dayjs(strutkural?.tgl_sk).format("DD-MM-YYYY"),
    nomor_sk: strutkural?.no_sk,
    aktif: strutkural?.aktif,
    file: `${url}${strutkural?.file_struktural}`,
    jenis_mutasi: "MJ",
  }));

  const rwytJabatanPelaksana = jabatanPelaksana?.map((strutkural) => ({
    id: `pelaksana_${strutkural?.pelaksana_id}`,
    jenis_jabatan: "Pelaksana",
    jabatan: strutkural?.jfu?.name,
    unor: `${strutkural?.instansi} - ${strutkural?.unit_kerja}`,
    tmt_jabatan: dayjs(strutkural?.tmt_jab).format("DD-MM-YYYY"),
    tgl_sk: dayjs(strutkural?.tgl_sk).format("DD-MM-YYYY"),
    nomor_sk: strutkural?.no_sk,
    aktif: strutkural?.aktif,
    file: `${url}${strutkural?.file_jfu}`,
    jenis_mutasi: "MJ",
  }));

  const rwytJabatanFungsional = jabatanFungsional?.map((strutkural) => ({
    id: `fungsional_${strutkural?.fungsional_id}`,
    jenis_jabatan: "Fungsional",
    jabatan: `${strutkural?.jft?.name} ${strutkural?.jft?.jenjang_jab}`,
    unor: `${strutkural?.instansi} - ${strutkural?.unit_kerja}`,
    tmt_jabatan: dayjs(strutkural?.tmt_jab).format("DD-MM-YYYY"),
    tgl_sk: dayjs(strutkural?.tgl_sk).format("DD-MM-YYYY"),
    nomor_sk: strutkural?.no_sk,
    aktif: strutkural?.aktif,
    file: `${url}${strutkural?.file_jft}`,
    jenis_mutasi: "MJ",
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

export const rwJabatanMasterByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
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
        ["desc"]
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

export const rwAngkakreditMasterByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;

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

export const rwSkpMasterByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
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

    const anomali = await Anomali23.query().where({ nip_baru: nip });
    const data = {
      ...result?.data,
      anomali,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const dataUtamaMasterByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
    const { organization_id, current_role, role, group } = req?.user;

    const admin = current_role === "admin";
    const fasilitatorBiasa =
      current_role === "user" && role === "FASILITATOR" && group === "MASTER";

    // check ngentot

    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/data-utama-master`
    );

    const user_organization_id = result?.data?.skpd?.id;

    const isTheSameOrganization = toString(user_organization_id)?.startsWith(
      toString(organization_id)
    );

    if (fasilitatorBiasa) {
      if (!isTheSameOrganization) {
        res.json(null);
      } else {
        const anomali = await Anomali23.query()
          .where({ nip_baru: nip })
          .withGraphFetched("user(simpleSelect)");
        const data = {
          ...result?.data,
          anomali,
        };

        res.json(data);
      }
    } else if (admin) {
      const anomali = await Anomali23.query()
        .where({ nip_baru: nip })
        .withGraphFetched("user(simpleSelect)");
      const data = {
        ...result?.data,
        anomali,
      };

      res.json(data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const dataPendidikanMasterNIP = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
    const hasil = await getRwPendidikanMaster(fetcher, nip);
    res.json(hasil?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const dataPendidikanMaster = async (req, res) => {
  res.json({});
};

export const rwPangkatMaster = async (req, res) => {
  try {
    const result = await getRwPangkat(req.fetcher, req.user.employee_number);
    const data = result?.data;
    console.log(result?.data?.length);
    const sortData = orderBy(
      data,
      (item) => {
        return item?.pangkat?.gol_ruang;
      },
      "desc"
    );
    res.json(sortData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const rwDiklatMaster = async (req, res) => {
  try {
    const result = await getRwDiklat(req.fetcher, req.user.employee_number);
    const data = orderBy(result?.data, "tahun", "desc");

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const rwDiklatMasterByNip = async (req, res) => {
  try {
    const { nip } = req.query;
    const result = await getRwDiklat(req.fetcher, nip);
    const data = orderBy(result?.data, "tahun", "desc");

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const rwJabDokterByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
    const result = await getRwJabDokter(fetcher, nip);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const rwJabGuruByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
    const result = await getRwJabGuru(fetcher, nip);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const rwPasanganMasterByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
    const result = await getRwPasangan(fetcher, nip);

    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const kelengkapanDokumenByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
    const result = await getKelengkapanDokumen(fetcher, nip);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const kelengkapanDokumen = async () => {
  try {
    const { fetcher } = req;
    const { employee_number: nip } = req.user;
    const result = await getKelengkapanDokumen(fetcher, nip);

    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const rwAnakMasterByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
    const result = await getRwAnak(fetcher, nip);

    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const unorASN = async (req, res) => {
  try {
    const { clientCredentialsFetcher } = req;
    const result = await clientCredentialsFetcher.get(
      `/master-ws/pemprov/opd/departments-asn`
    );
    const hasil = result?.data?.map((item) => ({
      title: item?.name,
      value: item?.id,
      id: item?.id,
      pId: item?.pId,
    }));
    const data = arrayToTree(hasil, {
      parentProperty: "pId",
      customID: "id",
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const unorPTTPK = async (req, res) => {
  try {
    const { clientCredentialsFetcher } = req;
    const result = await clientCredentialsFetcher.get(
      `/master-ws/pemprov/opd/departments-pttpk`
    );
    const hasil = result?.data?.map((item) => ({
      title: item?.name,
      value: item?.id,
      id: item?.id,
      pId: item?.pId,
    }));
    const data = arrayToTree(hasil, {
      parentProperty: "pId",
      customID: "id",
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getRwPenghargaanByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
    const result = await getRwPenghargaan(fetcher, nip);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getRwSatyaLencanaByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
    const result = await getRwSatyaLencana(fetcher, nip);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getDepartmentDetail = async (req, res) => {
  try {
    const { id } = req?.query;
    const fetcher = req?.fetcher;

    const result = await departmentDetail(fetcher, id);
    const data = result?.data;
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const employeeTodayBirthday = async (req, res) => {
  try {
    const { fetcher } = req;

    const result = await employeeTodayBirthdayDetail(fetcher);

    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const urlToPdf = async (req, res) => {
  try {
    const pdfUrl = req?.body?.url;
    const response = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response?.data, "binary");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=file.pdf");
    res.send(buffer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getAtasan = async (req, res) => {
  try {
    if (!req?.query?.nip) {
      res.status(400).json({ code: 400, message: "NIP is required" });
    } else {
      let nipAtasan = null;
      const { nip } = req?.query;

      const currentUser = await SyncPegawaiMaster.query()
        .where("nip_master", nip)
        .first()
        .select("skpd_id");

      if (currentUser?.skpd_id) {
        let unorAtasan = currentUser.skpd_id;

        // Iterasi untuk mencari atasan dengan memotong 2 karakter terakhir setiap kali
        while (unorAtasan.length >= 3) {
          const atasan = await SyncPegawaiMaster.query()
            .where("skpd_id", unorAtasan)
            .andWhere("jenis_jabatan", "Struktural")
            .select("nip_master")
            .first();

          if (atasan) {
            nipAtasan = atasan.nip_master;
            break;
          }

          // Potong 2 karakter terakhir
          unorAtasan = unorAtasan.slice(0, -2);
        }
      }

      res.json({ nip_master: nipAtasan });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  getAtasan,
  urlToPdf,
  employeeTodayBirthday,
  unorASN,
  unorPTTPK,
  rwDiklatMaster,
  rwDiklatMasterByNip,
  rwJabatanMaster,
  rwAngkakreditMaster,
  rwSkpMaster,
  dataUtamaMaster,
  dataUtamaMasterByNip,
  rwJabatanMasterByNip,
  rwAngkakreditMasterByNip,
  rwSkpMasterByNip,
  rwPangkatMaster,
  rwPasanganMasterByNip,
  rwAnakMasterByNip,
  rwJabDokterByNip,
  rwJabGuruByNip,
  getRwPenghargaanByNip,
  kelengkapanDokumen,
  kelengkapanDokumenByNip,
  getDepartmentDetail,
  getRwSatyaLencanaByNip,
};
