import axios from "axios";
import FormData from "form-data";

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
  const response = await fetcher.get(
    "/profilasn/api/orang-siasn?id=7E85A2743B04BD8DE050640A3C036B36"
  );
  return response.data;
};

export const createPeremajaanPendidikanSIASN = async (token, data) => {
  const fetcher = createFetcher(token);
  const url = `/siasn-instansi/api/peremajaan/orang-pendidikan/simpan-usul?pns_orang_id=${data.pns_orang_id}&sumber=instansi&unor_verifikator_id=${UNOR_VERIFIKATOR_ID}`;
  const response = await fetcher.post(url, data);
  return response.data;
};
export const uploadFilePeremajaanPendidikanSIASN = async (token, data) => {
  const fetcher = createFetcher(token);

  const formData = new FormData();
  const { id_ref_dokumen, usulan_id, nama_dokumen, file } = data;

  formData.append("id_ref_dokumen", id_ref_dokumen);
  formData.append("usulan_id", usulan_id);
  formData.append("nama_dokumen", nama_dokumen);
  formData.append("file", file);

  const response = await fetcher.post("/peremajaan/upload-dok", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...formData.getHeaders(),
    },
  });
  return response.data;
};

/**
 *
 * { "usulan_id": "5926b65d-b629-42b4-bbd1-33d28563d2fe", "tipe": "U", "pns_orang_id": "A5EB0427059AF6A0E040640A040252AD", "id_riwayat": "8ae483a864f5a1f30165221115e2754b", "tahun_lulus": 2016, "nomor_ijazah": "04-1-10761", "nama_sek": "UNIV ISLAM MALANG", "glr_depan": "", "keterangan": "", "glr_belakang": "S.Pt.", "tgl_tahun_lulus": "2016-01-01", "pendidikan_id": "ff808081523eb303015243cacec945ba", "pendidikan_nama": "S-1 PETERNAKAN", "is_pendidikan_pertama": false, "pencantuman_gelar": "", "tingkat_pendidikan_id": 40, "tingkat_pendidikan_nama": "S-1/Sarjana", "dok_transkrip_nilai": "peremajaan/usulan/871_5926b65d-b629-42b4-bbd1-33d28563d2fe.pdf", "dok_ijazah": "peremajaan/usulan/870_5926b65d-b629-42b4-bbd1-33d28563d2fe.pdf", "dok_sk_pencantuman_gelar": null }
 *  */

export const updateDataPeremajaanPendidikanSIASN = async (token, data) => {
  const fetcher = createFetcher(token);
  const url = `/peremajaan/orang-pendidikan/update-data`;
  const {
    usulan_id,
    tipe,
    pns_orang_id,
    id_riwayat,
    tahun_lulus,
    nomor_ijazah,
    nama_sek,
    glr_depan,
    keterangan,
    glr_belakang,
    tgl_tahun_lulus,
    pendidikan_id,
    pendidikan_nama,
    is_pendidikan_pertama,
    pencantuman_gelar,
    tingkat_pendidikan_id,
    tingkat_pendidikan_nama,
    dok_transkrip_nilai,
    dok_ijazah,
    dok_sk_pencantuman_gelar,
  } = data;

  const formData = new FormData();
  formData.append("usulan_id", usulan_id);
  formData.append("tipe", tipe);
  formData.append("pns_orang_id", pns_orang_id);
  formData.append("id_riwayat", id_riwayat);
  formData.append("tahun_lulus", tahun_lulus);
  formData.append("nomor_ijazah", nomor_ijazah);
  formData.append("nama_sek", nama_sek);
  formData.append("glr_depan", glr_depan);
  formData.append("keterangan", keterangan);
  formData.append("glr_belakang", glr_belakang);
  formData.append("tgl_tahun_lulus", tgl_tahun_lulus);
  formData.append("pendidikan_id", pendidikan_id);
  formData.append("pendidikan_nama", pendidikan_nama);
  formData.append("is_pendidikan_pertama", is_pendidikan_pertama);
  formData.append("pencantuman_gelar", pencantuman_gelar);
  formData.append("tingkat_pendidikan_id", tingkat_pendidikan_id);
  formData.append("tingkat_pendidikan_nama", tingkat_pendidikan_nama);
  formData.append("dok_transkrip_nilai", dok_transkrip_nilai);
  formData.append("dok_ijazah", dok_ijazah);
  formData.append("dok_sk_pencantuman_gelar", dok_sk_pencantuman_gelar);

  const response = await fetcher.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...formData.getHeaders(),
    },
  });
  return response.data;
};

export const submitPeremajaanPendidikanSIASN = async (token, data) => {};
