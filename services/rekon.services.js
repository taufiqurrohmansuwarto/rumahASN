import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/rekon",
});

export const getUnorSimaster = async () => {
  return api.get("/unor/simaster").then((res) => res?.data);
};

export const getUnorSiasn = async () => {
  return api.get("/unor/siasn").then((res) => res?.data);
};

export const getUnorRekon = async (masterId) => {
  return api.get(`/unor?master_id=${masterId}`).then((res) => res?.data);
};

export const getUnorRekonById = async (unorId) => {
  return api.get(`/unor/rekon/${unorId}`).then((res) => res?.data);
};

export const getDetailUnorSimaster = async (id) => {
  return api.get(`/unor/simaster/${id}`).then((res) => res?.data);
};

export const getDetailUnorSiasn = async (id) => {
  return api.get(`/unor/siasn/${id}`).then((res) => res?.data);
};

export const postUnorRekon = async (payload) => {
  return api.post("/unor", payload).then((res) => res?.data);
};

export const updateUnorRekon = async (unorId, payload) => {
  return api.patch(`/unor/${unorId}`, payload).then((res) => res?.data);
};

export const deleteUnorRekon = async (unorId) => {
  return api.delete(`/unor/${unorId}`).then((res) => res?.data);
};

export const getRekonUnorStatistics = async () => {
  return api.get("/unor/statistics").then((res) => res?.data);
};
