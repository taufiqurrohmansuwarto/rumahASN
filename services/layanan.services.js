import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/layanan",
});

export const getStandarLayanan = (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
  });

  return api.get(`/standar-pelayanan?${queryStr}`).then((res) => res?.data);
};

export const getLayananById = (id) => {
  return api.get(`/standar-pelayanan/${id}`).then((res) => res?.data);
};

export const createStandarLayanan = (data) => {
  return api.post(`/standar-pelayanan`, data).then((res) => res?.data);
};

export const updateStandarLayanan = ({ id, data }) => {
  return api.patch(`/standar-pelayanan/${id}`, data).then((res) => res?.data);
};

export const deleteStandarLayanan = (id) => {
  return api.delete(`/standar-pelayanan/${id}`).then((res) => res?.data);
};
