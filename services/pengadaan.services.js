import axios from "axios";
import qs from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/pengadaan",
});

export const dumpPeserta = async (data) => {
  return api.post("/casn/dump").then((res) => res.data);
};

export const getAllPeserta = async (query) => {
  const queryString = qs.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });

  return api.get(`/casn?${queryString}`).then((res) => res.data);
};

export const findPeserta = async (noPeserta) => {
  return api.get(`/casn/${noPeserta}`).then((res) => res.data);
};

export const updatePeserta = async (noPeserta, data) => {
  return api.put(`/casn/${noPeserta}`, data).then((res) => res.data);
};

export const deletePeserta = async (noPeserta) => {
  return api.delete(`/casn/${noPeserta}`).then((res) => res.data);
};

export const pesertaHadir = async (noPeserta) => {
  return api.put(`/casn/${noPeserta}/register`).then((res) => res.data);
};

export const pesertaTidakHadir = async (noPeserta) => {
  return api.delete(`/casn/${noPeserta}/register`).then((res) => res.data);
};
