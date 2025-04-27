import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/master/kualitas-data/accuracy",
});

export const dashboardAccuracy = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return await api.get(`/dashboard?${params}`).then((res) => res.data);
};

export const tmtCpnsLebihBesarDariTMTPNS = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return await api
    .get(`/tmt-cpns-lebih-besar-dari-tmt-pns?${params}`)
    .then((res) => res.data);
};

export const jenisDPKPegawaiTidakSesuai = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return await api
    .get(`/jenis-dpk-pegawai-tidak-sesuai?${params}`)
    .then((res) => res.data);
};

export const masaKerjaKurangDari2TahunStruktural = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return await api
    .get(`/masa-kerja-kurang-struktural?${params}`)
    .then((res) => res.data);
};

export const nikBelumValid = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return await api.get(`/nik-belum-valid?${params}`).then((res) => res.data);
};

export const pelaksanaNamaJabatanFungsional = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return await api
    .get(`/pelaksana-nama-jabatan-fungsional?${params}`)
    .then((res) => res.data);
};

export const tingkatPendidikanJabatanFungsionalTidakMemenuhiSyarat = async (
  query
) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return await api
    .get(`/pendidikan-jf-tidak-memenuhi-syarat?${params}`)
    .then((res) => res.data);
};
