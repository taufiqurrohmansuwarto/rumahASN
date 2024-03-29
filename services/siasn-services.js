import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/siasn/ws",
});

// referensi
export const refJenisDiklat = () => {
  return api.get("/ref/jenis-diklat").then((res) => res.data);
};

export const refUrusanPemerintahan = () => {
  return api.get("/ref/urusan-pemerintahan").then((res) => res.data);
};

export const refDiklatStruktural = () => {
  return api.get("/ref/diklat-struktural").then((res) => res.data);
};

export const dataKinerjaPns = (nip) => {
  return api.get(`/pns-kinerja/${nip}`).then((res) => res.data);
};

export const dataUtamaSIASN = () => {
  return api.get("/pns/data-utama").then((res) => res.data);
};

export const updateDataUtamaSIASN = (data) => {
  return api.post("/pns/data-utama", data).then((res) => res.data);
};

export const dataRiwayatKeluargaSIASN = () => {
  return api.get("/pns/rw-keluarga").then((res) => res.data);
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

export const cltnByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-cltn`).then((res) => res.data);
};

export const penghargaanByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-penghargaan`).then((res) => res.data);
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

export const dataOrtu = () => {
  return api.get(`/pns/rw-ortu`).then((res) => res.data);
};

export const dataAnak = () => {
  return api.get(`/pns/rw-anak`).then((res) => res.data);
};

export const dataIpAsn = (tahun) => {
  const currentTahun = tahun || new Date().getFullYear();
  return api.get(`/pns/ip-asn?tahun=${currentTahun}`).then((res) => res.data);
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

export const dataUtamSIASNByNip = (nip) => {
  return api.get(`/admin/${nip}/data-utama`).then((res) => res.data);
};

export const unitOrganisasi = () => {
  return api.get("/ref/unor").then((res) => res.data);
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

export const ipAsnByNip = (nip, tahun) => {
  return api.get(`/admin/${nip}/ip-asn?tahun=${tahun}`).then((res) => res.data);
};

export const getRwDiklatByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-diklat`).then((res) => res.data);
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

// peta jabatan
export const petaJabatan = async () => {
  return api.get(`/perencanaan/peta-jabatan`).then((res) => res.data);
};

export const petaJabatanById = async (id) => {
  return api.get(`/perencanaan/peta-jabatan/${id}`).then((res) => res.data);
};
