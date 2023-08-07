import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/master/ws",
});

// single
export const rwJabatanMaster = () => {
  return api.get("/rw-jabatan").then((res) => res.data);
};

export const rwAngkakreditMaster = () => {
  return api.get("/rw-angkakredit").then((res) => res.data);
};

export const rwSkpMaster = () => {
  return api.get("/rw-skp").then((res) => res.data);
};

export const dataUtamaSimaster = () => {
  return api.get("/data-utama").then((res) => res.data);
};

// admin
export const dataUtamaMasterByNip = (nip) => {
  return api.get(`/admin/${nip}/data-utama`).then((res) => res.data);
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
