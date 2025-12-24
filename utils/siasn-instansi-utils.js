import axios from "axios";
import FormData from "form-data";
import { logger } from "./logger";

// badan kepegawaian daerah
const UNOR_VERIFIKATOR_ID = "466D9577BDB70F89E050640A29022FEF";

const createFetcher = (token) => {
  return axios.create({
    baseURL: "https://api-siasn.bkn.go.id",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const testingFetcher = async (token) => {
  const fetcher = createFetcher(token);

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetcher.get(
        "/profilasn/api/orang-siasn?id=7E85A2743B04BD8DE050640A3C036B36"
      );

      const result = response.data;
      resolve(result);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Internal server error";
      reject({
        message: errorMessage,
        code: error?.response?.status || 500,
      });
    }
  });
};

export const createPeremajaanPendidikanSIASN = async (token, data) => {
  const fetcher = createFetcher(token);

  return new Promise(async (resolve, reject) => {
    try {
      const url = `/siasn-instansi/api/peremajaan/orang-pendidikan/simpan-usul?pns_orang_id=${data.pns_orang_id}&sumber=instansi&unor_verifikator_id=${UNOR_VERIFIKATOR_ID}`;
      const response = await fetcher.post(url, data);

      const result = response.data;
      resolve(result);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Internal server error";
      reject({
        message: errorMessage,
        code: error?.response?.data?.code || 500,
      });
    }
  });
};

export const uploadFilePeremajaanPendidikanSIASN = async (token, data) => {
  const fetcher = createFetcher(token);

  return new Promise(async (resolve, reject) => {
    try {
      const formData = new FormData();
      const { id_ref_dokumen, usulan_id, nama_dokumen, file } = data;

      formData.append("id_ref_dokumen", id_ref_dokumen);
      formData.append("usulan_id", usulan_id);
      formData.append("nama_dokumen", nama_dokumen);
      formData.append("file", file?.buffer, {
        filename: `${id_ref_dokumen}.pdf`,
        contentType: "application/pdf",
      });

      const url = `/siasn-instansi/api/peremajaan/upload-dok`;

      const response = await fetcher.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...formData.getHeaders(),
        },
      });

      const result = response.data;
      resolve(result);
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.response?.data?.message || "Internal server error";
      reject({
        message: errorMessage,
        code: error?.response?.data?.code || 500,
      });
    }
  });
};

/**
 *
 * { "usulan_id": "5926b65d-b629-42b4-bbd1-33d28563d2fe", "tipe": "U", "pns_orang_id": "A5EB0427059AF6A0E040640A040252AD", "id_riwayat": "8ae483a864f5a1f30165221115e2754b", "tahun_lulus": 2016, "nomor_ijazah": "04-1-10761", "nama_sek": "UNIV ISLAM MALANG", "glr_depan": "", "keterangan": "", "glr_belakang": "S.Pt.", "tgl_tahun_lulus": "2016-01-01", "pendidikan_id": "ff808081523eb303015243cacec945ba", "pendidikan_nama": "S-1 PETERNAKAN", "is_pendidikan_pertama": false, "pencantuman_gelar": "", "tingkat_pendidikan_id": 40, "tingkat_pendidikan_nama": "S-1/Sarjana", "dok_transkrip_nilai": "peremajaan/usulan/871_5926b65d-b629-42b4-bbd1-33d28563d2fe.pdf", "dok_ijazah": "peremajaan/usulan/870_5926b65d-b629-42b4-bbd1-33d28563d2fe.pdf", "dok_sk_pencantuman_gelar": null }
 *  */

export const updateDataPeremajaanPendidikanSIASN = async (token, data) => {
  const fetcher = createFetcher(token);
  const url = `/siasn-instansi/api/peremajaan/orang-pendidikan/update-data`;

  const formData = new FormData();
  // formData.append("usulan_id", usulan_id);
  // formData.append("tipe", tipe);
  // formData.append("pns_orang_id", pns_orang_id);
  // formData.append("id_riwayat", id_riwayat);
  // formData.append("tahun_lulus", tahun_lulus);
  // formData.append("nomor_ijazah", nomor_ijazah);
  // formData.append("nama_sek", nama_sek);
  // formData.append("glr_depan", glr_depan);
  // formData.append("keterangan", keterangan);
  // formData.append("glr_belakang", glr_belakang);
  // formData.append("tgl_tahun_lulus", tgl_tahun_lulus);
  // formData.append("pendidikan_id", pendidikan_id);
  // formData.append("pendidikan_nama", pendidikan_nama);
  // formData.append("is_pendidikan_pertama", is_pendidikan_pertama);
  // formData.append("pencantuman_gelar", pencantuman_gelar);
  // formData.append("tingkat_pendidikan_id", tingkat_pendidikan_id);
  // formData.append("tingkat_pendidikan_nama", tingkat_pendidikan_nama);
  // formData.append("dok_transkrip_nilai", dok_transkrip_nilai);
  // formData.append("dok_ijazah", dok_ijazah);
  // formData.append("dok_sk_pencantuman_gelar", dok_sk_pencantuman_gelar);

  const normalize = (value) => {
    if (value === null || value === undefined) return "null";
    return value;
  };

  Object.entries(data).forEach(([key, value]) => {
    if (key === "is_pendidikan_pertama") {
      // Handle berbagai format: boolean, string "1"/"0", number 1/0
      const isPendidikanPertama =
        value === true || value === "1" || value === 1;
      formData.append(key, isPendidikanPertama ? "1" : "0");
      return;
    }

    formData.append(key, normalize(value));
  });

  const response = await fetcher.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...formData.getHeaders(),
    },
  });

  return response.data;
};

export const submitPeremajaanPendidikanSIASN = async (token, usulan_id) => {
  const fetcher = createFetcher(token);
  const url = `/siasn-instansi/api/peremajaan/verifikasi-berkas`;

  const formData = new FormData();
  formData.append("usulan_id", usulan_id);
  formData.append("rekomendasi_approval", "1");
  formData.append("instansi_kerja_id", "A5EB03E23CCCF6A0E040640A040252AD");
  formData.append("instansi_induk", "A5EB03E23CCCF6A0E040640A040252AD");

  const response = await fetcher.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...formData.getHeaders(),
    },
  });

  return response.data;
};

/**
 *
 * @param {{"usulan_data":{"IDUsulan":[""]},"passphrase":"","one_time_code":""}} token
 * @param {*} usulan_id
 */
export const approvePeremajaanPendidikanSIASN = async (
  token,
  usulan_id,
  passphrase,
  one_time_code
) => {
  const fetcher = createFetcher(token);
  const url = `/siasn-instansi/api/peremajaan/monit-usulan/terima-usulan`;

  const body = {
    passphrase,
    one_time_code,
    usulan_data: {
      IDUsulan: [usulan_id],
    },
  };

  logger.info(JSON.stringify(body, null, 2));

  const response = await fetcher.post(url, body);

  return response.data;
};
