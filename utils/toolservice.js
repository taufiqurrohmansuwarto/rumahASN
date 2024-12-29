import {
  cariAtasanLangsung,
  cariPejabat,
  cariSeluruhRekanKerja,
  getPengguna,
} from "@/utils/ai-utils";
import { getDataUtamaMaster } from "@/utils/master.utils";
import axios from "axios";
import { TemplateHandler } from "easy-template-x";
import { uploadFileUsulan } from "./index";
// nanoid
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { trim } from "lodash";
dayjs.locale("id");

export const serializeDataUtama = (data) => {
  const nama = `${data?.gelar_depan} ${data?.nama} ${data?.gelar_belakang}`;
  return {
    nama: trim(nama),
    nip: data?.nip_baru,
    status_kepegawaian: data?.status,
    jenis_jabatan: data?.jabatan?.jenis_jabatan,
    jabatan: data?.jabatan?.jabatan,
    pangkat: `${data?.pangkat?.golongan}-${data?.pangkat?.pangkat}`,
    unit_kerja: data?.skpd?.detail,
  };
};

const urlDocxLupaAbsen =
  "https://siasn.bkd.jatimprov.go.id:9000/public/dokumen-lupa_absen.docx";

export const generateDocumentLupaAbsen = async (
  minio,
  tglPembuatan,
  pembuat,
  atasan,
  tanggalLupaAbsen,
  headerProperties
) => {
  const urlDocx = urlDocxLupaAbsen;

  const currentData = {
    tglPembuatan: dayjs(tglPembuatan).format("DD MMMM YYYY"),
    hari: dayjs(tanggalLupaAbsen).format("dddd"),
    tanggal: dayjs(tanggalLupaAbsen).format("DD MMMM YYYY"),
    nama: trim(pembuat?.nama),
    nip: pembuat?.nip,
    jabatan: trim(pembuat?.jabatan),
    unitKerja: trim(pembuat?.unit_organisasi),
    namaAtasan: trim(atasan?.nama),
    nipAtasan: atasan?.nip,
    jabatanAtasan: trim(atasan?.jabatan),
    unitKerjaAtasan: trim(atasan?.unit_organisasi),
    ...headerProperties,
  };

  const doc = await axios.get(urlDocx, {
    responseType: "arraybuffer",
  });

  const template = new TemplateHandler();
  const result = await template.process(doc.data, currentData);

  const fileBuffer = Buffer.from(result, "utf-8");
  const fileMimeType =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const fileSize = fileBuffer.length;

  const file = {
    buffer: fileBuffer,
    mimetype: fileMimeType,
    size: fileSize,
  };

  const filename = `temp_${nanoid()}-lupa-absen.docx`;
  await uploadFileUsulan(minio, filename, file);
  return `https://siasn.bkd.jatimprov.go.id:9000/public/${filename}`;
};

// mendapatkan file docx dari minio
// terdapat 3 file pada spt, individu, pasangan, dan kelompok

const getUrlDocx = async (dataPeserta) => {
  let url = "";
  if (dataPeserta?.length === 1) {
    url = `https://siasn.bkd.jatimprov.go.id:9000/public/spt-personal.docx`;
  } else if (dataPeserta?.length === 2) {
    url = `https://siasn.bkd.jatimprov.go.id:9000/public/spt-pasangan.docx`;
  } else if (dataPeserta?.length > 2) {
    url = `https://siasn.bkd.jatimprov.go.id:9000/public/spt-kelompok.docx`;
  }

  return url;
};

const serializeData = (data) => {
  let dataSerialized = {};
  const peserta = data?.peserta;
  const pejabat = data?.pejabat;

  if (peserta?.length === 1) {
    dataSerialized = {
      nomorSPT: data?.nomorSPT,
      dsr: data?.dasarSPT?.map((item, index) => ({
        ...item,
        no: index + 1 + 4,
      })),
      deskripsiKegiatanSPT: data?.deskripsiKegiatanSPT,
      judulKegiatanSPT: data?.judulKegiatanSPT,
      namaPertama: peserta[0]?.nama,
      nipPertama: peserta[0]?.nip,
      jabatanPertama: peserta[0]?.jabatan,
      golPertama: peserta[0]?.golongan,
      tglSPT: data?.tglSPT,
      jabatanPenandatangan: pejabat?.jabatan,
      unorPenandatangan: pejabat?.unor || pejabat?.skpd,
      namaPenandatangan: pejabat?.nama,
      golPenandatangan: pejabat?.golongan,
      nipPenandatangan: pejabat?.nip,
    };
  } else if (peserta?.length === 2) {
    dataSerialized = {
      nomorSPT: data?.nomorSPT,
      dsr: data?.dasarSPT?.map((item, index) => ({
        ...item,
        no: index + 1 + 4,
      })),
      deskripsiKegiatanSPT: data?.deskripsiKegiatanSPT,
      judulKegiatanSPT: data?.judulKegiatanSPT,
      namaPertama: peserta[0]?.nama,
      nipPertama: peserta[0]?.nip,
      jabatanPertama: peserta[0]?.jabatan,
      golPertama: peserta[0]?.golongan,
      namaKedua: peserta[1]?.nama,
      nipKedua: peserta[1]?.nip,
      jabatanKedua: peserta[1]?.jabatan,
      golKedua: peserta[1]?.golongan,
      tglSPT: data?.tglSPT,
      jabatanPenandatangan: pejabat?.jabatan,
      unorPenandatangan: pejabat?.unor || pejabat?.skpd,
      namaPenandatangan: pejabat?.nama,
      golPenandatangan: pejabat?.golongan,
      nipPenandatangan: pejabat?.nip,
    };
  } else if (peserta?.length > 2) {
    dataSerialized = {
      nomorSPT: data?.nomorSPT,
      dsr: data?.dasarSPT?.map((item, index) => ({
        ...item,
        no: index + 1 + 4,
      })),
      deskripsiKegiatanSPT: data?.deskripsiKegiatanSPT,
      judulKegiatanSPT: data?.judulKegiatanSPT,
      peserta: peserta?.map((item, index) => ({
        no: index + 1,
        ...item,
      })),
      tglSPT: data?.tglSPT,
      jabatanPenandatangan: pejabat?.jabatan,
      unorPenandatangan: pejabat?.unor || pejabat?.skpd,
      namaPenandatangan: pejabat?.nama,
      golPenandatangan: pejabat?.golongan,
      nipPenandatangan: pejabat?.nip,
    };
  }

  return dataSerialized;
};

export const generateDocument = async (data, minio) => {
  try {
    console.log("generate document spt");
    const dataSerialized = serializeData(data);

    const urlDocx = await getUrlDocx(data?.peserta);

    const doc = await axios.get(urlDocx, {
      responseType: "arraybuffer",
    });

    const template = new TemplateHandler();
    const result = await template.process(doc.data, dataSerialized);

    // file must containt file size and mimetype
    const fileBuffer = Buffer.from(result, "utf-8");
    const fileMimeType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const fileSize = fileBuffer.length;

    const file = {
      buffer: fileBuffer,
      mimetype: fileMimeType,
      size: fileSize,
    };

    const filename = `temp_${nanoid()}-spt.docx`;

    await uploadFileUsulan(minio, filename, file);
    return `https://siasn.bkd.jatimprov.go.id:9000/public/${filename}`;
  } catch (error) {
    console.error("Error generating document:", error);
    throw new Error("Failed to generate document");
  }
};

export const executeToolCall = async (functionName, args) => {
  const { organization_id, employee_number, fetcher, siasnRequest, minio } =
    args?.user;

  try {
    const availableFunctions = {
      get_atasan_langsung: async () => {
        try {
          const result = await cariAtasanLangsung(organization_id);
          return result;
        } catch (error) {
          throw new Error("Failed to get atasan langsung");
        }
      },
      get_peserta_spt: async ({ names }) => {
        try {
          const result = await cariSeluruhRekanKerja(organization_id);
          return result;
        } catch (error) {
          throw new Error("Failed to get peserta spt");
        }
      },
      get_pejabat: async () => {
        try {
          const result = await cariPejabat(organization_id);
          return result;
        } catch (error) {
          throw new Error("Failed to get pejabat");
        }
      },
      generate_document_spt: async ({ data }) => {
        try {
          console.log("execute generate document spt");
          const url = await generateDocument(data, minio);
          return {
            url,
          };
        } catch (error) {
          throw new Error("Failed to generate peserta spt");
        }
      },
      generate_document_lupa_absen: async ({ data }) => {
        try {
          console.log("execute generate document lupa absen");
          console.log(data);
          let promises = [];
          data?.dataLupaAbsen.forEach((item) => {
            promises.push(
              generateDocumentLupaAbsen(
                minio,
                data?.tglPembuatan,
                data?.informasiPengguna,
                data?.informasiAtasan,
                item?.tanggal
              )
            );
          });

          const result = await Promise.all(promises);

          return result;
        } catch (error) {
          throw new Error("Failed to generate document lupa absen");
        }
      },
      get_data_pengguna: async () => {
        try {
          const result = await getPengguna(employee_number);
          return result;
        } catch (error) {
          throw new Error("Failed to get data pengguna");
        }
      },
      get_data_utama_siasn: async () => {
        try {
          const result = await getDataUtamaMaster(fetcher, employee_number);
          return result;
        } catch (error) {
          console.log(error);
          throw new Error("Failed to get data utama from SIASN");
        }
      },
      cari_usulan_siasn: async ({ tipe_usulan }) => {
        // tipe usulan harus kenaikan-pangkat, pemberhentian, skk, pg, dan pmk
        try {
          const url = `/siasn-ws/layanan/${tipe_usulan}/${employee_number}`;
          const result = await fetcher.get(url);
          const data = result?.data;
          if (!data) {
            return null;
          } else {
            return data;
          }
        } catch (error) {
          console.log(error);
          throw new Error("Failed to get usulan from SIASN");
        }
      },
      search_employee: async (query) => {
        // Your weather API implementation
        return [
          { id: 1, name: "John Doe", city: "Jakarta", country: "Indonesia" },
        ];
      },
      cari_peserta_spt: async ({ names }) => {
        const result = await cariSeluruhRekanKerja(organization_id);

        return result;
      },
    };

    if (!(functionName in availableFunctions)) {
      throw new Error(`Function ${functionName} not found`);
    }

    return await availableFunctions[functionName](args);
  } catch (error) {
    throw new Error(`Tool execution failed: ${error.message}`);
  }
};
