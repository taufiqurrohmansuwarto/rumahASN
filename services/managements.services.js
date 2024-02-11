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

// permissions
export const createPermission = async (data) => {
  return await api.post(`/permissions`, data).then((res) => res?.data);
};

export const updatePermission = async ({ id, data }) => {
  return await api.patch(`/permissions/${id}`, data).then((res) => res?.data);
};

export const deletePermission = async (id) => {
  return await api.delete(`/permissions/${id}`).then((res) => res?.data);
};

export const getPermissions = async () => {
  return await api.get(`/permissions`).then((res) => res?.data);
};

// roles permissions
export const getRolePermissions = async (id) => {
  return await api
    .get(`/roles/${id}/roles-permissions`)
    .then((res) => res?.data);
};

export const updateRolePermission = async ({ id, data }) => {
  return await api
    .put(`/roles/${id}/roles-permissions`, data)
    .then((res) => res?.data);
};
