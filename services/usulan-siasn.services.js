import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/siasn/ws/pns/usulan-siasn",
});

export const usulanPemberhentian = () => {
  return api.get(`/pemberhentian`).then((res) => res?.data);
};

export const usulanPerbaikanNama = () => {
  return api.get(`/perbaikan-nama`).then((res) => res?.data);
};

export const usulanPenyesuaianMasaKerja = () => {
  return api.get(`/masa-kerja`).then((res) => res?.data);
};

export const usulanPencantumanGelar = () => {
  return api.get(`/pencantuman-gelar`).then((res) => res?.data);
};

export const usulanKenaikanPangkat = () => {
  return api.get(`/kenaikan-pangkat`).then((res) => res?.data);
};
