import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/master/kualitas-data/completeness",
});

export const dashboardCompleteness = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/dashboard?${params}`).then((res) => res.data);
};

export const jabatanKosong = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/jabatan-kosong?${params}`).then((res) => res.data);
};

export const pendidikanKosong = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/pendidikan-kosong?${params}`).then((res) => res.data);
};

export const tmtPnsKosong = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/tmt-pns-kosong?${params}`).then((res) => res.data);
};

export const gelarKosong = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/gelar-kosong?${params}`).then((res) => res.data);
};

export const emailKosong = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/email-kosong?${params}`).then((res) => res.data);
};

export const noHpKosong = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return await api.get(`/no-hp-kosong?${params}`).then((res) => res.data);
};
