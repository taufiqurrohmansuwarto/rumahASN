import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/admins/sync",
});

export const syncPegawaiMaster = () => {
  return api.put("/pegawai").then((res) => res.data);
};

export const pegawaiMaster = (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });
  return api.get(`/pegawai?${qs}`).then((res) => res.data);
};

export const downloadPegawaiMaster = () => {
  return api
    .get("/pegawai?limit=-1", {
      responseType: "blob",
    })
    .then((res) => res.data);
};

export const syncUnorMaster = () => {
  return api.put("/unor-master").then((res) => res.data);
};

export const refSinkronisasi = () => {
  return api.get("/").then((res) => res.data);
};

export const syncSimasterJfu = () => {
  return api.put("/simaster-jfu").then((res) => res.data);
};

export const syncSimasterJft = () => {
  return api.put("/simaster-jft").then((res) => res.data);
};
