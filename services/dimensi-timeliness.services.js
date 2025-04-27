import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/master/kualitas-data/timeliness",
});

export const dashboardTimeliness = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/dashboard?${params}`).then((res) => res.data);
};

export const cpnsLebihDariSatuTahun = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api
    .get(`/cpns-lebih-dari-satu-tahun?${params}`)
    .then((res) => res.data);
};

export const strukturalGanda = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/struktural-ganda?${params}`).then((res) => res.data);
};

export const bupMasihAktif = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/bup-masih-aktif?${params}`).then((res) => res.data);
};

export const cltnSetelahTanggalBerakhir = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api
    .get(`/cltn-setelah-tanggal-berakhir?${params}`)
    .then((res) => res.data);
};
