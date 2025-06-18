import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/partners/bankjatim",
});

export const pingKoneksi = () => {
  return api.post("/ping").then((res) => res?.data);
};

export const pengajuanKredit = (data) => {
  return api.post("/loans/apply", data).then((res) => res?.data);
};

export const cekPeminjamanKredit = (data) => {
  return api.post("/loans/check", data).then((res) => res?.data);
};

export const simulasiKredit = (data) => {
  return api.post("/loans/simulasi", data).then((res) => res?.data);
};

export const historiesKredit = (data) => {
  return api.post("/loans/histories", data).then((res) => res?.data);
};
