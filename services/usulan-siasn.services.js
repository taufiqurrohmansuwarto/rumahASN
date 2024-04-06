import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/ws/siasn/pns/usulan-siasn",
});

export const usulanPemberhentian = () => {
  return api.get(`/pemberhentian`).then((res) => res?.data);
};

export const usulanPerbaikanNama = () => {
  return api.get(`/perbaikan-nama`).then((res) => res?.data);
};

export const usulanPenyesuaianMasaKerja = () => {
  return api.get(`/penyesuaian-masa-kerja`).then((res) => res?.data);
};

export const usulanPencantumanGelar = (nip) => {
  return api.get(`/pencantuman-gelar?nip=${nip}`).then((res) => res?.data);
};
