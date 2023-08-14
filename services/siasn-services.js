import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/siasn/ws",
});

export const dataUtamaSIASN = () => {
  return api.get("/pns/data-utama").then((res) => res.data);
};

// data pendidikan
export const dataPendidikan = () => {
  return api.get("/pns/rw-pendidikan").then((res) => res.data);
};

export const dataGolongan = () => {
  return api.get("/pns/rw-golongan").then((res) => res.data);
};

export const dataMasaKerja = () => {
  return api.get("/pns/rw-masakerja").then((res) => res.data);
};

export const dataPenghargaan = () => {
  return api.get("/pns/rw-penghargaan").then((res) => res.data);
};

// end of shit

export const dataUtamSIASNByNip = (nip) => {
  return api.get(`/admin/${nip}/data-utama`).then((res) => res.data);
};

export const unitOrganisasi = () => {
  return api.get("/ref/unor").then((res) => res.data);
};

export const refJft = (jabatan) => {
  return api.get(`/ref/jft?jabatan=${jabatan}`).then((res) => res.data);
};

export const refJfu = (jabatan) => {
  return api.get(`/ref/jfu?jabatan=${jabatan}`).then((res) => res.data);
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

export const postRwJabatanByNip = ({ nip, data }) => {
  return api.post(`/admin/${nip}/rw-jabatan`, data).then((res) => res.data);
};

// angkakredit
export const getRwAngkakredit = () => {
  return api.get("/pns/rw-angkakredit").then((res) => res.data);
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
