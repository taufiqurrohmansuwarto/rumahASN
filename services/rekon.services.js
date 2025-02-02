import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/rekon",
});

// jfu and sync
export const getJfuSimaster = async () => {
  return api.get("/jfu/simaster").then((res) => res?.data);
};

export const getJfuSiasn = async () => {
  return api.get("/jfu/siasn").then((res) => res?.data);
};

export const syncJfuSimaster = async () => {
  return api.get("/jfu/simaster/sync").then((res) => res?.data);
};

export const syncJfuSiasn = async () => {
  return api.get("/jfu/siasn/sync").then((res) => res?.data);
};

export const deleteJfuRekon = async (jfuId) => {
  return api.delete(`/jfu/${jfuId}`).then((res) => res?.data);
};

export const getRekonJfu = async (masterId) => {
  return api.get(`/jfu?master_id=${masterId}`).then((res) => res?.data);
};

export const postJfuRekon = async (payload) => {
  return api.post("/jfu", payload).then((res) => res?.data);
};

// unor
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

export const reportRekonUnor = async () => {
  return api
    .get(`/unor/report`, {
      responseType: "blob",
    })
    .then((res) => res?.data);
};

// jft
export const getJftSimaster = async () => {
  return api.get("/jft/simaster").then((res) => res?.data);
};

export const getJftSiasn = async () => {
  return api.get("/jft/siasn").then((res) => res?.data);
};

export const getDetailJftSimaster = async (id) => {
  return api.get(`/jft/simaster/${id}`).then((res) => res?.data);
};

export const postJftRekon = async (payload) => {
  return api.post("/jft", payload).then((res) => res?.data);
};

export const getJftRekon = async (masterId) => {
  return api.get(`/jft?master_id=${masterId}`).then((res) => res?.data);
};

export const deleteJftRekon = async (jftId) => {
  return api.delete(`/jft/${jftId}`).then((res) => res?.data);
};

export const getRekonJftStatistics = async () => {
  return api.get("/jft/statistics").then((res) => res?.data);
};

export const reportJftUnor = async () => {
  return api
    .get(`/jft/report`, {
      responseType: "blob",
    })
    .then((res) => res?.data);
};
