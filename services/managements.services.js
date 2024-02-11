import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/managements",
});

export const createRole = async (data) => {
  return await api.post(`/roles`, data).then((res) => res?.data);
};

export const updateRole = async ({ id, data }) => {
  return await api.patch(`/roles/${id}`, data).then((res) => res?.data);
};

export const deleteRole = async (id) => {
  return await api.delete(`/roles/${id}`).then((res) => res?.data);
};

export const getRoles = async () => {
  return await api.get(`/roles`).then((res) => res?.data);
};
