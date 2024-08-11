import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/siasn/ws/pns/usulan-siasn",
});

export const usulanPemberhentian = async () => {
  const res = await api.get(`/pemberhentian`);
  return res?.data;
};

export const usulanPerbaikanNama = async () => {
  const res = await api.get(`/perbaikan-nama`);
  return res?.data;
};

export const usulanPenyesuaianMasaKerja = async () => {
  const res = await api.get(`/masa-kerja`);
  return res?.data;
};

export const usulanPencantumanGelar = async () => {
  const res = await api.get(`/pencantuman-gelar`);
  return res?.data;
};

export const usulanKenaikanPangkat = async () => {
  const res = await api.get(`/kenaikan-pangkat`);
  return res?.data;
};
