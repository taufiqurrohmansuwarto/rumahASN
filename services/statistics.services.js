import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/public/statistics",
});

export const getPerangkatDaerah = async () => {
  return await api.get(`/perangkat_daerah`).then((res) => res?.data);
};

export const getJenisJabatan = async (perangkat_daerah) => {
  return await api
    .get(`/${perangkat_daerah}/jenis-jabatan`)
    .then((res) => res?.data);
};

export const getGolongan = async (perangkat_daerah) => {
  return await api
    .get(`/${perangkat_daerah}/golongan`)
    .then((res) => res?.data);
};

export const getJumlah = async (perangkat_daerah) => {
  return await api.get(`/${perangkat_daerah}/jumlah`).then((res) => res?.data);
};

export const getPendidikan = async (perangkat_daerah) => {
  return await api
    .get(`/${perangkat_daerah}/pendidikan`)
    .then((res) => res?.data);
};

export const getJenisKelamin = async (perangkat_daerah) => {
  return await api
    .get(`/${perangkat_daerah}/jenis-kelamin`)
    .then((res) => res?.data);
};

export const getUsia = async (perangkat_daerah) => {
  return await api.get(`/${perangkat_daerah}/usia`).then((res) => res?.data);
};
