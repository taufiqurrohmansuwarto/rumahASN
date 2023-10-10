import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/layanan-kepegawaian",
});

// crud admin
export const createLayanan = (data) => {
  return api.post(`/admin/create`, data).then((res) => res?.data);
};

export const readLayanan = (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
  });

  return api.get(`/admin/read?${queryStr}`).then((res) => res?.data);
};

export const updateLayanan = (data) => {
  return api.put(`/admin/update`, data).then((res) => res?.data);
};

// read user
