import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/master/ws",
});

export const getDisparitasByNip = (nip) => {
  return api.get(`/admin/${nip}/disparitas`).then((res) => res.data);
};

export const getDokumenFasilitator = () => {
  return api.get("/fasilitator/download-sk", {
    responseType: "arraybuffer",
  });
};

const masterApi = axios.create({
  baseURL: "/helpdesk/api/master",
});

export const searchUpdateJabatan = (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api.get(`/tasks/jabatan?${params}`).then((res) => res.data);
};

export const getDisparitas = () => {
  return api.get("/disparitas").then((res) => res.data);
};

export const compareEmployeesSimasterSiasn = () => {
  return api
    .get("/fasilitator/dashboard-compare-siasn")
    .then((res) => res.data);
};

export const employeeBirthdayTodayServices = () => {
  return api.get("/employee-birthday").then((res) => res.data);
};

export const getUnorMasterDetail = (id) => {
  return api.get(`/unor/${id}/detail`).then((res) => res.data);
};

// download ip-asn
export const downloadDataIPASN = () => {
  return api
    .get("/fasilitator/download/ip-asn", {
      responseType: "arraybuffer",
    })
    .then((res) => res.data);
};

export const downloadEmployees = (query) => {
  const url = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });

  return api
    .get(`/fasilitator/download/data-siasn?${url}`, {
      responseType: "arraybuffer",
    })
    .then((res) => res.data);
};

export const getAllEmployeesPaging = (query) => {
  return api
    .get(
      `/fasilitator/employees?${queryString.stringify(query, {
        skipNull: true,
        skipEmptyString: true,
      })}`
    )
    .then((res) => res.data);
};

export const getAllEmployeesPagingAdmin = (query) => {
  return api
    .get(
      `/admin/employees-admin?${queryString.stringify(query, {
        skipNull: true,
        skipEmptyString: true,
      })}`
    )
    .then((res) => res.data);
};

export const getRwPenghargaanByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-penghargaan`).then((res) => res.data);
};

export const getRwHukdisByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-hukdis`).then((res) => res.data);
};

export const getRwSatyaLencanaByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-satyalencana`).then((res) => res.data);
};

export const getRwSertifikasiByNipMaster = (nip) => {
  return api.get(`/admin/${nip}/rw-sertifikasi`).then((res) => res.data);
};

export const getOpdFasilitator = () => {
  return api.get(`/fasilitator/unor`).then((res) => res.data);
};

export const getOpdAdmin = () => {
  return api.get(`/admin/unor`).then((res) => res.data);
};

// unor asn
export const unorASN = () => {
  return api.get("/unor/asn").then((res) => res.data);
};

export const unorPTTPK = () => {
  return api.get("/unor/pttpk").then((res) => res.data);
};

// single
export const rwJabatanMaster = () => {
  return api.get("/rw-jabatan").then((res) => res.data);
};

export const rwPasanganMaster = async () => {
  return api.get("/rw-pasangan").then((res) => res.data);
};

export const rwAnakMaster = async () => {
  return api.get("/rw-anak").then((res) => res.data);
};

export const rwDiklatMaster = () => {
  return api.get("/rw-diklat").then((res) => res.data);
};

export const rwDiklatMasterByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-diklat`).then((res) => res.data);
};

export const rwAngkakreditMaster = () => {
  return api.get("/rw-angkakredit").then((res) => res.data);
};

export const rwSkpMaster = () => {
  return api.get("/rw-skp").then((res) => res.data);
};

export const rwGolonganMaster = () => {
  return api.get("/rw-golongan").then((res) => res.data);
};

export const dataUtamaSimaster = () => {
  return api.get("/data-utama").then((res) => res.data);
};

export const rwPendidikan = () => {
  return api.get("/rw-pendidikan").then((res) => res.data);
};

export const kelengkapanDokumenMaster = () => {
  return api.get("/kelengkapan-dokumen").then((res) => res.data);
};

// admin
export const dataUtamaMasterByNip = (nip) => {
  return api.get(`/admin/${nip}/data-utama`).then((res) => res.data);
};

export const kelengkapanDokumenMasterByNip = (nip) => {
  return api.get(`/admin/${nip}/kelengkapan-dokumen`).then((res) => res.data);
};

export const rwJabatanMasterByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-jabatan`).then((res) => res.data);
};

export const rwAngkakreditMasterByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-angkakredit`).then((res) => res.data);
};

export const rwSkpMasterByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-skp`).then((res) => res.data);
};

export const rwPendidikanMasterByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-pendidikan`).then((res) => res.data);
};

export const rwKedudukanHukumByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-kedudukan-hukum`).then((res) => res.data);
};

export const rwAnakByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-anak`).then((res) => res.data);
};

export const rwDiklatByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-diklat`).then((res) => res.data);
};

export const rwPasanganByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-pasangan`).then((res) => res.data);
};

export const rwPindahByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-pindah`).then((res) => res.data);
};

export const rwJabGuruByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-jab-guru`).then((res) => res.data);
};

export const rwJabDokterByNip = (nip) => {
  return api.get(`/admin/${nip}/rw-jab-dokter`).then((res) => res.data);
};

// dokumen administrasi

// download
export const downloadDocumentByNip = (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api
    .get(`/admin/${query?.nip}/dokumen-administrasi-download?${params}`)
    .then((res) => res?.data);
};

// check
export const checkDocumentByNip = (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api
    .get(`/admin/${query?.nip}/dokumen-administrasi-check?${params}`)
    .then((res) => res?.data);
};

// perbaikan
export const downloadDokumenPerbaikanNip = (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api
    .get(`/admin/${query?.nip}/dokumen-perbaikan/download?${params}`)
    .then((res) => res?.data);
};

// check
export const checkDokumenPerbaikanByNip = (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api
    .get(`/admin/${query?.nip}/dokumen-perbaikan/check?${params}`)
    .then((res) => res?.data);
};

export const urlToPdf = (data) => {
  return api
    .post("/download-file", data, {
      responseType: "blob",
    })
    .then((res) => res.data);
};

export const masterUnorBackup = () => {
  return masterApi.get("/unor-backup").then((res) => res.data);
};

export const simasterJftBackup = () => {
  return masterApi.get("/simaster-jft").then((res) => res.data);
};

export const simasterJfuBackup = () => {
  return masterApi.get("/simaster-jfu").then((res) => res.data);
};

export const getAtasan = (nip) => {
  return masterApi.get(`/get-atasan?nip=${nip}`).then((res) => res.data);
};
