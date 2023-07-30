import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/siasn/ws",
});

export const dataUtamaSIASN = () => {
  return api.get("/pns/data-utama").then((res) => res.data);
};

export const dataUtamSIASNByNip = (nip) => {
  return api.get(`/pns/${nip}/data-utama`).then((res) => res.data);
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

export const postRwJabatan = (data) => {
  return api.post("/pns/rw-jabatan", data).then((res) => res.data);
};

// angkakredit
export const getRwAngkakredit = () => {
  return api.get("/pns/rw-angkakredit").then((res) => res.data);
};

export const postRwAngkakredit = (data) => {
  return api.post("/pns/rw-angkakredit", data).then((res) => res.data);
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

export const getTokenSIASNService = () => {
  return api.get("/token").then((res) => res.data);
};
