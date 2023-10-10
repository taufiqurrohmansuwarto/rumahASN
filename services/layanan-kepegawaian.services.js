import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/employee-services",
});

// crud admin
export const createLayanan = (data) => {
  return api.post(`/admin`, data).then((res) => res?.data);
};

export const detailLayanan = (id) => {
  return api.get(`/admin/${id}`).then((res) => res?.data);
};

export const readLayanan = (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
  });

  return api.get(`/admin?${queryStr}`).then((res) => res?.data);
};

export const updateLayanan = ({ id, data }) => {
  return api.patch(`/admin/${id}`, data).then((res) => res?.data);
};

export const deleteLayanan = (id) => {
  return api.delete(`/admin/${id}`).then((res) => res?.data);
};

// read user
