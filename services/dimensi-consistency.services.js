import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/master/kualitas-data/consistency",
});

export const dashboardConsistency = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/dashboard?${params}`).then((res) => res.data);
};

export const consistency1 = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/con1?${params}`).then((res) => res.data);
};

export const consistency2 = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/con2?${params}`).then((res) => res.data);
};

export const consistency3 = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/con3?${params}`).then((res) => res.data);
};

export const consistency4 = async (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return await api.get(`/con4?${params}`).then((res) => res.data);
};
