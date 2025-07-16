import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/siasn/ws",
});

const siasnBaseUrl = axios.create({
  baseURL: "/helpdesk/api/siasn",
});

export const syncPendidikan = async () => {
  return api.put(`/ref/pendidikan`).then((res) => res.data);
};

export const findPendidikan = async (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api.get(`/ref/pendidikan?${queryStr}`).then((res) => res.data);
};

export const syncLembagaSertifikasi = async () => {
  return api.put(`/ref/lembaga-sertifikasi`).then((res) => res.data);
};

export const findLembagaSertifikasi = async (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api
    .get(`/ref/lembaga-sertifikasi?${queryStr}`)
    .then((res) => res.data);
};

export const syncRumpunJabatanJf = async () => {
  return api.put(`/ref/rumpun-jabatan-jf`).then((res) => res.data);
};

export const findRumpunJabatanJf = async (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api.get(`/ref/rumpun-jabatan-jf?${queryStr}`).then((res) => res.data);
};

export const getDisparitasSKP = async () => {
  return api.get("/disparitas/skp").then((res) => res.data);
};

// referensi
export const refJenisDiklat = () => {
  return api.get("/ref/jenis-diklat").then((res) => res.data);
};

export const refPendidikan = () => {
  return siasnBaseUrl.get("/pendidikan").then((res) => res.data);
};

export const refJenisRiwayat = () => {
  return api.get("/ref/jenis-riwayat").then((res) => res.data);
};

export const refStatusUsul = () => {
  return api.get("/ref/status-usul").then((res) => res.data);
};

export const refUrusanPemerintahan = () => {
  return api.get("/ref/urusan-pemerintahan").then((res) => res.data);
};

export const getKinerjaPeriodikPersonal = () => {
  return api.get("/pns/kinerja-periodik").then((res) => res.data);
};

export const refDiklatStruktural = () => {
  return api.get("/ref/diklat-struktural").then((res) => res.data);
};

export const dataKinerjaPns = (nip) => {
  return api.get(`/pns-kinerja/${nip}`).then((res) => res.data);
};

// cpns
export const createCpns = ({ nip, data }) => {
  return api.post(`/admin/${nip}/cpns`, data).then((res) => res.data);
};

// riwayat sertifikasi
export const riwayatSertifikasiByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-sertifikasi`).then((res) => res?.data);
};

export const createSertifikasiByNip = ({ nip, data }) => {
  return api
    .post(`/admin/${nip}/rw-sertifikasi`, data)
    .then((res) => res?.data);
};

export const cekUnor = (id) => {
  return api.get(`/admin/cek-unor/${id}`).then((res) => res.data);
};

export const atasanKinerja = (search) => {
  return api
    .get(`/pns/cari-atasan-kinerja?search=${search}`)
    .then((res) => res.data);
};

export const atasanKinerjaByNip = ({ nip, search }) => {
  return api
    .get(`/cari-atasan-kinerja?nip=${nip}&search=${search}`)
    .then((res) => res.data);
};

export const dataUtamaSIASN = () => {
  return api.get("/pns/data-utama").then((res) => res.data);
};

export const fotoSiasn = () => {
  return api.get("/pns/foto").then((res) => res.data);
};

export const updateFotoSiasn = () => {
  return api.put("/pns/foto").then((res) => res.data);
};

export const updateDataUtamaSIASN = (data) => {
  return api.post("/pns/data-utama", data).then((res) => res.data);
};

export const dataRiwayatKeluargaSIASN = () => {
  return api.get("/pns/rw-keluarga").then((res) => res.data);
};

export const dataRiwayatPengadaanPersonal = () => {
  return api.get("/pns/rw-pengadaan").then((res) => res.data);
};

export const dataRiwayatPengadaanPersonalByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-pengadaan`).then((res) => res.data);
};

// data pendidikan
export const dataPendidikan = () => {
  return api.get("/pns/rw-pendidikan").then((res) => res.data);
};

export const dataPendidikanByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-pendidikan`).then((res) => res.data);
};

export const downloadDataIPASN = (query) => {
  const type = query?.type;
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  if (type === "xlsx") {
    console.log("client dengan tipe xlsx");
    return api
      .get(`/admin/ip-asn/download?${queryStr}`, {
        responseType: "blob",
      })
      .then((res) => res?.data);
  } else {
    return api
      .get(`/admin/ip-asn/download?${queryStr}`)
      .then((res) => res.data);
  }
};

export const dataPangkatByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-pangkat`).then((res) => res.data);
};

// foto
export const fotoByNip = (nip) => {
  return api.get(`/admin/${nip}/foto`).then((res) => res.data);
};

export const updateFotoByNip = (nip) => {
  return api.post(`/admin/${nip}/foto`).then((res) => res.data);
};

export const cltnByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-cltn`).then((res) => res.data);
};

export const penghargaanByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-penghargaan`).then((res) => res.data);
};

export const createPenghargaanByNip = ({ nip, data }) => {
  return api.post(`/admin/${nip}/rw-penghargaan`, data).then((res) => res.data);
};

export const hapusPenghargaanByNip = ({ nip, id }) => {
  return api
    .delete(`/admin/${nip}/rw-penghargaan/${id}`)
    .then((res) => res.data);
};

export const dataRiwayatMasaKerja = (nip) => {
  return api.get(`/admin/${nip}/rw-masakerja`).then((res) => res.data);
};

export const dataMasaKerja = () => {
  return api.get("/pns/rw-masakerja").then((res) => res.data);
};

export const dataPenghargaan = () => {
  return api.get("/pns/rw-penghargaan").then((res) => res.data);
};

export const dataCltn = () => {
  return api.get(`/pns/rw-cltn`).then((res) => res.data);
};

export const dataDiklat = () => {
  return api.get(`/pns/rw-diklat`).then((res) => res.data);
};

export const dataPasangan = () => {
  return api.get(`/pns/rw-pasangan`).then((res) => res.data);
};

export const tambahPasanganSIASN = (data) => {
  return api.post(`/pns/rw-pasangan`, data).then((res) => res.data);
};

export const dataOrtu = () => {
  return api.get(`/pns/rw-ortu`).then((res) => res.data);
};

export const dataAnak = () => {
  return api.get(`/pns/rw-anak`).then((res) => res.data);
};

export const dataAnakByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-anak`).then((res) => res.data);
};

export const postAnakByNip = ({ nip, data }) => {
  return api.post(`/admin/${nip}/rw-anak`, data).then((res) => res.data);
};

export const postPasanganByNip = ({ nip, data }) => {
  return api.post(`/admin/${nip}/rw-pasangan`, data).then((res) => res.data);
};

export const dataIpAsn = (tahun) => {
  const currentTahun = tahun || new Date().getFullYear();
  return api.get(`/pns/ip-asn?tahun=${currentTahun}`).then((res) => res.data);
};

export const dataNilaiIPASN = () => {
  return api.get("/pns/nilai-ipasn").then((res) => res.data);
};

// end of shit

// add more the shit
export const dataPencantumanGelar = () => {
  return api.get(`/pns/pencantuman-gelar`).then((res) => res?.data);
};

export const dataPencantumanGelarByNip = (nip) => {
  return api.get(`/admin/${nip}/pencantuman-gelar`).then((res) => res?.data);
};

export const dataPencantumanGelarSKByNip = ({ nip, id }) => {
  return api
    .get(`/admin/${nip}/pencantuman-gelar/${id}`)
    .then((res) => res?.data);
};

export const dataPasanganByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-pasangan`).then((res) => res?.data);
};

export const dataUtamSIASNByNip = (nip) => {
  return api.get(`/admin/${nip}/data-utama`).then((res) => res.data);
};

export const dataUtamSIASNByNipAdmin = (nip) => {
  return api.get(`/admin/${nip}/data-utama-admin`).then((res) => res.data);
};

export const updateDataUtamaByNip = ({ nip, data }) => {
  return api.post(`/admin/${nip}/data-utama`, data).then((res) => res.data);
};

export const unitOrganisasi = () => {
  return api.get("/ref/unor").then((res) => res.data);
};

export const resetUnor = () => {
  return api.get(`/ref/unor-siasn?limit=-1`).then((res) => res.data);
};

export const employeesByUnitOrganisasi = (id) => {
  return api.get(`/ref/unor/${id}/employees`).then((res) => res?.data);
};

export const removeBackup = () => {
  return api.delete("/ref/unor").then((res) => res?.data);
};

export const refJft = (jabatan) => {
  return api.get(`/ref/jft?jabatan=${jabatan}`).then((res) => res.data);
};

export const refJfu = (jabatan) => {
  return api.get(`/ref/jfu?jabatan=${jabatan}`).then((res) => res.data);
};

export const refJenisMutasi = () => {
  return api.get("/ref/jenis-mutasi").then((res) => res.data);
};

export const refJenisPenugasan = () => {
  return api.get("/ref/jenis-penugasan").then((res) => res.data);
};

export const refSubJabatan = (jabatan) => {
  return api.get(`/ref/sub-jabatan?jabatan=${jabatan}`).then((res) => res.data);
};

// version 2
export const getRefJftV2 = () => {
  return api.get("/ref/v2/jft").then((res) => res.data);
};

export const getRefJfuV2 = () => {
  return api.get("/ref/v2/jfu").then((res) => res.data);
};

export const getSubJabatanV2 = (fungsionalId) => {
  return api
    .get(`/ref/v2/sub-jabatan?fungsional_id=${fungsionalId}`)
    .then((res) => res.data);
};

export const getRefJftSiasnById = (id) => {
  return api.get(`/ref/v2/jft-siasn/${id}`).then((res) => res.data);
};

// jabatan
export const getRwJabatan = () => {
  return api.get("/pns/rw-jabatan").then((res) => res.data);
};

export const getRwJabatanByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-jabatan`).then((res) => res.data);
};

export const postRwJabatan = (data) => {
  return api.post("/pns/rw-jabatan", data).then((res) => res.data);
};

export const postRwKursus = (data) => {
  return api.post("/pns/rw-diklat", data).then((res) => res?.data);
};

export const deleteKursus = (id) => {
  return api.delete(`/pns/rw-diklat/${id}`).then((res) => res?.data);
};

export const deleteDiklat = (id) => {
  return api.delete(`/pns/rw-diklat/struktural/${id}`).then((res) => res?.data);
};

export const ipAsnByNip = (nip, tahun) => {
  return api.get(`/admin/${nip}/ip-asn?tahun=${tahun}`).then((res) => res.data);
};

export const trackingLayananSIASN = ({
  nip,
  tipeUsulan = "kenaikan-pangkat",
}) => {
  return api
    .get(`/admin/${nip}/layanan-siasn?tipe_usulan=${tipeUsulan}`)
    .then((res) => res.data);
};

export const getRwDiklatByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-diklat`).then((res) => res.data);
};

export const postRwDiklatByNip = ({ nip, data }) => {
  return api.post(`/admin/${nip}/rw-diklat`, data).then((res) => res.data);
};

export const removeDiklatKursusById = ({ nip, id }) => {
  return api.delete(`/admin/${nip}/rw-diklat/${id}`).then((res) => res.data);
};

// angkakredit
export const getRwAngkakredit = () => {
  return api.get("/pns/rw-angkakredit").then((res) => res.data);
};

export const deleteAkByNip = ({ nip, id }) => {
  return api
    .delete(`/admin/${nip}/rw-angkakredit/${id}`)
    .then((res) => res.data);
};

export const deleteAk = (id) => {
  return api.delete(`/pns/rw-angkakredit/${id}`).then((res) => res.data);
};

export const getRwAngkakreditByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-angkakredit`).then((res) => res.data);
};

export const postRwAngkakredit = (data) => {
  return api.post("/pns/rw-angkakredit", data).then((res) => res.data);
};

export const postRwAngkakreditByNip = ({ nip, data }) => {
  return api.post(`/admin/${nip}/rw-angkakredit`, data).then((res) => res.data);
};

// hukdis
export const getRwHukdis = () => {
  return api.get("/pns/rw-hukdis").then((res) => res.data);
};

export const postRwHukdisByNip = ({ nip, data }) => {
  return api.post(`/admin/${nip}/rw-hukdis`, data).then((res) => res.data);
};

export const getRwGolongan = () => {
  return api.get("/pns/rw-golongan").then((res) => res.data);
};

// skp
export const getRwSkp = () => {
  return api.get("/pns/rw-skp").then((res) => res.data);
};

// skp22
export const getRwSkp22 = () => {
  return api.get("/pns/rw-skp22").then((res) => res.data);
};

export const postRwSkp22 = (data) => {
  return api.post("/pns/rw-skp22", data).then((res) => res.data);
};

export const getRwSkp22ByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-skp22`).then((res) => res.data);
};

// kinerja periodik
export const getRwKinerjaPeriodikByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-kinerjaperiodik`).then((res) => res.data);
};

export const createKinerjaPeriodikByNip = ({ nip, data }) => {
  return api
    .post(`/admin/${nip}/rw-kinerjaperiodik`, data)
    .then((res) => res.data);
};

export const removeKinerjaPeriodikByNip = ({ id, nip }) => {
  return api
    .delete(`/admin/${nip}/rw-kinerjaperiodik/${id}`)
    .then((res) => res.data);
};

export const postRwSkp22ByNip = ({ nip, data }) => {
  return api.post(`/admin/${nip}/rw-skp22`, data).then((res) => res.data);
};

export const getTokenSIASNService = () => {
  return api.get("/token").then((res) => res.data);
};

export const getPnsAllByNip = (nip) => {
  return api.get(`/admin/${nip}/pns-all`).then((res) => res.data);
};

export const getRwPindahInstansiByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-pindah-instansi`).then((res) => res.data);
};

export const postRiwayatKursusByNip = ({ nip, data }) => {
  return api.post(`/admin/${nip}/rw-diklat`, data).then((res) => res.data);
};

export const getDaftarKenaikanPangkatByPeriode = (periode) => {
  return api.get(`/admin/kp?periode=${periode}`).then((res) => res.data);
};

export const uploadDokumenKenaikanPangkat = (data) => {
  return api
    .post(`/admin/kp/upload`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export const getRwPwkByNip = async (nip) => {
  return api.get(`/admin/${nip}/rw-pwk`).then((res) => res.data);
};

export const getHukdisByNip = async (nip) => {
  return api.get(`/admin/${nip}/rw-hukdis`).then((res) => res.data);
};

export const getPnsUnorByNip = async (nip) => {
  return api.get(`/admin/${nip}/rw-pnsunor`).then((res) => res.data);
};

export const getRiwayatKeluargaByNip = async (nip) => {
  return api.get(`/admin/${nip}/rw-keluarga`).then((res) => res.data);
};

export const postUnorJabatanByNip = async ({ nip, data }) => {
  return api.post(`/admin/${nip}/unor-jabatan`, data).then((res) => res.data);
};

export const removeJabatan = async ({ nip, id }) => {
  return api.delete(`/admin/${nip}/rw-jabatan/${id}`).then((res) => res.data);
};

export const getDaftarPemberhentianSIASN = (data) => {
  const { tglAwal, tglAkhir } = data;

  return api
    .get(`/admin/pemberhentian?tglAwal=${tglAwal}&tglAkhir=${tglAkhir}`)
    .then((res) => res.data);
};

// report employees
export const showEmployees = (query) => {
  return api
    .get(`/report/employees?${queryString.stringify(query)}`)
    .then((res) => res.data);
};

export const downloadEmployeesSIASN = ({ downloadFormat = "excel" }) => {
  return api
    .get(`/report/employees?limit=-1&downloadFormat=${downloadFormat}`, {
      responseType: "blob",
    })
    .then((res) => res.data);
};

export const uploadEmployees = async (data) => {
  return api
    .post(`/report/employees`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res?.data);
};

export const showIPASN = (query) => {
  return api
    .get(`/report/ip-asn?${queryString.stringify(query)}`)
    .then((res) => res.data);
};

export const uploadIPASN = async (data) => {
  return api
    .post(`/report/ip-asn`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res?.data);
};

// ref jft
export const showRefJft = (query) => {
  return api
    .get(`/report/ref-jft?${queryString.stringify(query)}`)
    .then((res) => res.data);
};

export const uploadRefJft = async (data) => {
  return api
    .post(`/report/ref-jft`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res?.data);
};

// peta jabatan
export const petaJabatan = async () => {
  return api.get(`/perencanaan/peta-jabatan`).then((res) => res.data);
};

export const petaJabatanById = async (id) => {
  return api.get(`/perencanaan/peta-jabatan/${id}`).then((res) => res.data);
};

// kinerja periodik
export const getRwKinerjaPeriodik = async (nip) => {
  return api.get(`/pns/rw-kinerjaperiodik/${nip}`).then((res) => res.data);
};

// delete
export const deleteRwKinerjaPeriodik = async (id) => {
  return api.delete(`/kinerjaperiodik/delete/${id}`).then((res) => res.data);
};

// create
export const createdRwKinerjaPeriodik = async (data) => {
  return api.post(`/kinerjaperiodik/save`, data).then((res) => res.data);
};

// refresh jabatan dan golongan
export const refreshGolongan = async () => {
  return api.put(`/pns/sync/golongan`).then((res) => res.data);
};

export const refreshJabatan = async () => {
  return api.put(`/pns/sync/jabatan`).then((res) => res.data);
};

export const refreshJabatanByNip = async (nip) => {
  return api.get(`/admin/${nip}/sync/jabatan`).then((res) => res.data);
};

export const refreshGolonganByNip = async (nip) => {
  return api.get(`/admin/${nip}/sync/golongan`).then((res) => res.data);
};

export const inboxUsulanByNip = async ({ nip, layananId }) => {
  return api
    .get(`/admin/${nip}/inbox-layanan?layanan_id=${layananId}`)
    .then((res) => res.data);
};

export const inboxUsulan = async (layananId) => {
  return api
    .get(`/pns/inbox-layanan?layanan_id=${layananId}`)
    .then((res) => res.data);
};

// admin
export const daftarPengadaan = async (query) => {
  return api
    .get(
      `/admin/pengadaan?${queryString.stringify(query, {
        skipEmptyString: true,
        skipNull: true,
      })}`
    )
    .then((res) => res.data);
};

export const syncPengadaan = async (query) => {
  return api
    .get(`/admin/pengadaan/sync?${queryString.stringify(query)}`)
    .then((res) => res.data);
};

// download dokumen pengadaan
export const downloadDokumenPengadaan = async (query) => {
  return api
    .get(
      `/admin/pengadaan/download?${queryString.stringify(query, {
        skipEmptyString: true,
        skipNull: true,
      })}`
    )
    .then((res) => res.data);
};

export const daftarKenaikanPangkat = async (query) => {
  const currentQuery = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api.get(`/admin/kp?${currentQuery}`).then((res) => res.data);
};

export const daftarKenaikanPerangkatDaerah = async (query) => {
  const currentQuery = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  console.log("currentQuery", currentQuery);

  return api
    .get(`/admin/kp/perangkat-daerah?${currentQuery}`)
    .then((res) => res.data);
};

export const daftarPemberhentianPerangkatDaerah = async (query) => {
  const currentQuery = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api
    .get(`/admin/pemberhentian/perangkat-daerah?${currentQuery}`)
    .then((res) => res.data);
};

export const syncKenaikanPangkat = async (query) => {
  return api
    .get(`/admin/kp/sync?${queryString.stringify(query)}`)
    .then((res) => res.data);
};

export const syncPemberhentianSIASN = async (query) => {
  return api
    .get(`/admin/pemberhentian/sync?${queryString.stringify(query)}`)
    .then((res) => res.data);
};

export const daftarPemberhentian = async (query) => {
  return api
    .get(
      `/admin/pemberhentian?${queryString.stringify(query, {
        skipEmptyString: true,
        skipNull: true,
      })}`
    )
    .then((res) => res.data);
};

export const rwPemberhentianByNip = async (nip) => {
  return api.get(`/admin/${nip}/rw-pemberhentian`).then((res) => res.data);
};

export const trackingKenaikanPangkatByNipFasilitator = async (nip) => {
  return api
    .get(`/admin/${nip}/layanan-siasn/kenaikan-pangkat`)
    .then((res) => res.data);
};

export const trackingPemberhentianByNipFasilitator = async (nip) => {
  return api
    .get(`/admin/${nip}/layanan-siasn/pemberhentian`)
    .then((res) => res.data);
};

export const trackingPerbaikanNamaByNipFasilitator = async (nip) => {
  return api
    .get(`/admin/${nip}/layanan-siasn/perbaikan-nama`)
    .then((res) => res.data);
};

export const trackingPencantumanGelarByNipFasilitator = async (nip) => {
  return api
    .get(`/admin/${nip}/layanan-siasn/pencantuman-gelar`)
    .then((res) => res.data);
};

export const trackingPenyesuaianMasaKerjaByNip = async (nip) => {
  return api
    .get(`/admin/${nip}/layanan-siasn/penyesuaian-masa-kerja`)
    .then((res) => res.data);
};

export const getDetailUnor = async (id) => {
  return api.get(`/ref/unor/${id}/detail`).then((res) => res.data);
};

export const getDataKppn = async () => {
  return api.get(`/ref/kpkn`).then((res) => res.data);
};

export const updateKpkn = async (nip) => {
  return api.patch(`/`);
};

export const reportDisparitasUnorById = async (id) => {
  return api
    .get(`/ref/unor/${id}/report`, {
      responseType: "blob",
    })
    .then((res) => res.data);
};

export const getDetailDisparitasUnor = async (id) => {
  return api.get(`/ref/unor/${id}/disparitas`).then((res) => res.data);
};

export const updateDisparitasUnor = async ({ id, data }) => {
  return api.patch(`/ref/unor/${id}/disparitas`, data).then((res) => res.data);
};

export const uploadDokRiwayat = async (data) => {
  return api
    .post(`/upload-dok-rw`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export const getRwPotensi = async () => {
  return api.get(`/pns/rw-potensi`).then((res) => res.data);
};

export const getRwKompetensi = async () => {
  return api.get(`/pns/rw-kompetensi`).then((res) => res.data);
};

export const getRwKompetensiByNip = async (nip) => {
  return api.get(`/admin/${nip}/rw-kompetensi`).then((res) => res.data);
};

export const getRwPotensiByNip = async (nip) => {
  return api.get(`/admin/${nip}/rw-potensi`).then((res) => res.data);
};

// gelar
export const getGelar = async () => {
  return api.get(`/pns/gelar`).then((res) => res.data);
};

export const checkGelar = async ({ gelarId, loc }) => {
  return api
    .get(`/pns/gelar/${gelarId}/check?loc=${loc}`)
    .then((res) => res.data);
};

export const uncheckGelar = async ({ gelarId, loc }) => {
  return api
    .get(`/pns/gelar/${gelarId}/uncheck?loc=${loc}`)
    .then((res) => res.data);
};

export const getGelarByNip = async (nip) => {
  return api.get(`/admin/${nip}/gelar`).then((res) => res.data);
};

export const checkGelarByNip = async ({ nip, gelarId, loc }) => {
  return api
    .get(`/admin/${nip}/gelar/${gelarId}/check?loc=${loc}`)
    .then((res) => res.data);
};

export const uncheckGelarByNip = async ({ nip, gelarId, loc }) => {
  return api
    .get(`/admin/${nip}/gelar/${gelarId}/uncheck?loc=${loc}`)
    .then((res) => res.data);
};

// pengadaan proxy
export const getPengadaanProxy = async (query) => {
  return api
    .get(`/admin/pengadaan/proxy?${queryString.stringify(query)}`)
    .then((res) => res.data);
};

// detail pengadaan proxy
export const getDetailPengadaanProxy = async (id) => {
  return api.get(`/admin/pengadaan/proxy/detail/${id}`).then((res) => res.data);
};

export const usulkanPengadaanProxy = async ({ id, data }) => {
  return api
    .post(`/admin/pengadaan/proxy/detail/${id}`, data)
    .then((res) => res.data);
};

// generate sk
export const generateSK = async (query) => {
  return api
    .get(`/admin/pengadaan/proxy/generate/sk?${queryString.stringify(query)}`, {
      responseType: "blob",
    })
    .then((res) => res.data);
};

export const syncPengadaanProxy = async (query) => {
  return api
    .get(`/admin/pengadaan/proxy/sync?${queryString.stringify(query)}`)
    .then((res) => res.data);
};

// download
export const uploadDokumenPengadaanProxy = async (query) => {
  return api
    .get(`/admin/pengadaan/proxy/download?${queryString.stringify(query)}`)
    .then((res) => res.data);
};

export const downloadAllDokumenPengadaanProxy = async (query) => {
  return api
    .get(
      `/admin/pengadaan/proxy/download/all?${queryString.stringify(query)}`,
      {
        responseType: "blob",
      }
    )
    .then((res) => res.data);
};

export const resetUploadDokumenPengadaanProxy = async ({ id, query }) => {
  const currentQuery = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api
    .get(`/admin/pengadaan/proxy/download/${id}/reset?${currentQuery}`)
    .then((res) => res.data);
};

export const getListMfa = async (query) => {
  const currentQuery = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api.get(`/mfa?${currentQuery}`).then((res) => res.data);
};

export const syncMfa = async () => {
  return api.get(`/mfa/sync`).then((res) => res.data);
};
