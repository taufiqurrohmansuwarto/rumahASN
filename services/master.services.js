import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/master/ws",
});

export const rwJabatanMaster = () => {
  return api.get("/rw-jabatan").then((res) => res.data);
};

export const rwAngkakreditMaster = () => {
  return api.get("/rw-angkakredit").then((res) => res.data);
};

export const rwSkpMaster = () => {
  return api.get("/rw-skp").then((res) => res.data);
};
