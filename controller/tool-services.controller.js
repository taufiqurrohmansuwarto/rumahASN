const BotAssistantChatThreads = require("@/models/assistant_bot/chat-threads.model");
const BotAssistantMessages = require("@/models/assistant_bot/messages.model");
const SyncPegawai = require("@/models/sync-pegawai.model");
const SIASNEmployee = require("@/models/siasn-employees.model");
const HeaderSurat = require("@/models/letter_managements/headers.model");

import SiasnEmployees from "@/models/siasn-employees.model";
import {
  cariPejabatNew,
  cariSeluruhRekanKerja,
  getHeaderSuratUnitKerja,
  getPegawaiById,
  getPegawaiByIds,
  getPengguna,
  getTemanKerja,
} from "@/utils/ai-utils";
import { chatHistoryService } from "@/utils/chatHistoryService";
import { getDataUtamaMaster } from "@/utils/master.utils";
import {
  generateDocument,
  generateDocumentLupaAbsen,
  serializeDataUtama,
} from "@/utils/toolservice";
import axios from "axios";
import { raw } from "objection";
const Minio = require("minio");
const minioConfig = {
  port: parseInt(process.env.MINIO_PORT),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  endPoint: process.env.MINIO_ENDPOINT,
};

const mc = new Minio.Client(minioConfig);

const fetchDataUsulan = async (fetcher, tipeUsulan, employeeNumber) => {
  const url = `/siasn-ws/layanan/${tipeUsulan}/${employeeNumber}`;
  const result = await fetcher.get(url);
  const response = result?.data;
  return response;
};

export const saveMessageAssistant = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = data;
    await chatHistoryService.saveMessage(
      currentData?.threadId,
      currentData?.content,
      currentData?.role,
      currentData?.metadata,
      currentData?.user_id
    );

    res
      .status(200)
      .json({ success: true, message: "Message berhasil di simpan" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveThreadAssistant = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = data;
    const getThread = await BotAssistantChatThreads.query().findById(
      currentData?.id
    );

    if (!getThread) {
      const data = {
        id: currentData?.id,
        user_id: currentData?.user_id,
        title: currentData?.title,
        status: "active",
        assistant_id: currentData?.assistant_id,
      };

      await chatHistoryService.saveThread(
        data?.id,
        data?.user_id,
        data?.title,
        data?.assistant_id
      );
      return res
        .status(200)
        .json({ success: true, message: "Thread berhasil di simpan" });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "Thread sudah ada" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkUsulan = async (req, res) => {
  try {
    const data = req?.body;

    const currentData = data;

    const accessToken = currentData?.accessToken;
    const employeeNumber = currentData?.employee_number;
    const tipeUsulan = currentData?.tipe_usulan;

    const fetcher = axios.create({
      baseURL: process.env.APIGATEWAY_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await fetchDataUsulan(fetcher, tipeUsulan, employeeNumber);

    // seralize data biar ndak terlalu lebar ke mana
    const serializeData = (result) => {
      if (!result?.length) {
        return [];
      } else {
        return result?.map((item) => {
          return {
            id: item?.id,
            nama: item?.nama,
            nip: item?.nip,
            status_usulan: item?.status_usulan,
            type: item?.type,
            jenis_layanan_nama: item?.jenis_layanan_nama,
            tanggal_usulan: item?.tanggal_usulan,
            keterangan: item?.keterangan,
          };
        });
      }
    };

    res.json(serializeData(result));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAtasanLangsung = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPesertaSpt = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = data;
    const result = await getTemanKerja(
      currentData?.names,
      currentData?.organization_id
    );
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPejabat = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = data;
    const organizationId = currentData?.organization_id;
    const result = await cariPejabatNew(organizationId, currentData?.nama);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDataUtamaSiasn = async (req, res) => {
  try {
    const currentData = req?.currentUser;
    const fetcher = axios.create({
      baseURL: process.env.APIGATEWAY_URL,
      headers: {
        Authorization: `Bearer ${currentData?.accessToken}`,
      },
    });

    const result = await getDataUtamaMaster(
      fetcher,
      currentData?.employee_number
    );

    const dataPegawai = await SIASNEmployee.query()
      .where("nip_baru", currentData?.employee_number)
      .first();

    if (!dataPegawai) {
      return res
        .status(404)
        .json({ success: false, message: "Pegawai tidak ditemukan" });
    } else {
      const resultJson = serializeDataUtama(result);
      const hasil = {
        ...resultJson,
        // masa kerja tahun
        masa_kerja_tahun: `${dataPegawai?.mk_tahun} Tahun`,
        // masa kerja bulan
        masa_kerja_bulan: `${dataPegawai?.mk_bulan} Bulan`,
        // tingkat pendidikan nama
        tingkat_pendidikan_nama: dataPegawai?.tingkat_pendidikan_nama,
        // pendidikan nama
        pendidikan_nama: dataPegawai?.pendidikan_nama,
      };

      res.json(hasil);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const generateDocumentSpt = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = data;
    const parameter = currentData?.data;
    const parameterPeserta = parameter?.peserta?.map(
      (item) => item?.pegawai_id
    );

    const pejabat = await getPegawaiById(parameter?.pejabat_id);
    const peserta = await getPegawaiByIds(parameterPeserta);
    const header = await HeaderSurat.query().findById(parameter?.header_id);

    const payload = {
      ...parameter,
      pejabat,
      peserta,
      header,
    };

    console.log("payload", payload);

    const result = await generateDocument(payload, mc);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateDocLupaAbsen = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = data;
    const parameter = currentData?.data;
    console.log("parameter", parameter);

    const header = await HeaderSurat.query().findById(parameter?.header_id);
    const currentUser = await SyncPegawai.query()
      .where("nip_master", currentData?.employee_number)
      .select(
        raw(
          "gelar_depan_master || ' ' || nama_master || ' ' || gelar_belakang_master as nama"
        ),
        "nip_master as nip",
        raw("golongan_master || '-' || pangkat_master as pangkat"),
        "opd_master as unit_organisasi"
      )
      .withGraphFetched("siasn")
      .first();

    const currentAtasan = await SyncPegawai.query()
      .findById(parameter?.atasan_id)
      .select(
        raw(
          "trim(concat(gelar_depan_master, ' ', nama_master, ' ', gelar_belakang_master)) as nama"
        ),
        "nip_master as nip",
        raw("golongan_master || '-' || pangkat_master as pangkat"),
        "opd_master as unit_organisasi"
      )
      .withGraphFetched("siasn")
      .first();

    const pegawai = {
      nama: currentUser?.nama,
      nip: currentUser?.nip,
      pangkat: currentUser?.pangkat,
      jabatan: currentUser?.siasn?.jabatan_nama,
      unit_organisasi: currentUser?.unit_organisasi,
    };

    const atasan = {
      nama: currentAtasan?.nama,
      nip: currentAtasan?.nip,
      pangkat: currentAtasan?.pangkat,
      jabatan: currentAtasan?.siasn?.jabatan_nama,
      unit_organisasi: currentAtasan?.unit_organisasi,
    };

    const headerProperties = {
      namaInstansi: header?.nama_instansi,
      namaPerangkatDaerah: header?.nama_perangkat_daerah,
      alamat: header?.alamat,
      telepon: header?.telepon,
      lamanWeb: header?.laman_web,
      email: header?.email,
    };

    let promises = [];
    parameter?.dataLupaAbsen?.forEach((item) => {
      promises.push(
        generateDocumentLupaAbsen(
          mc,
          parameter?.tglPembuatan,
          pegawai,
          atasan,
          item?.tanggal,
          headerProperties
        )
      );
    });

    const result = await Promise.all(promises);
    console.log("result", result);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDataPengguna = async (req, res) => {
  try {
    const data = req?.body;
    const currentData = data;
    const result = await getPengguna(currentData?.employee_number);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHeaderSurat = async (req, res) => {
  try {
    const currentUser = req?.body;
    const skpdId = currentUser?.organization_id;
    const result = await getHeaderSuratUnitKerja(skpdId);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Header surat tidak ditemukan" });
    } else {
      res.json({ header_id: result?.id });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error });
  }
};
