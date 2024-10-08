import axios from "axios";

const adminApi = axios.create({
  baseURL: "/helpdesk/api/perencanaan/admin",
});

const userApi = axios.create({
  baseURL: "/helpdesk/api/perencanaan/users",
});

// admin

export const findUsulan = (query) => {
  return adminApi.get("/usulan", { params: query }).then((res) => res.data);
};

export const findUsulanById = (id) => {
  return adminApi.get(`/usulan/${id}`).then((res) => res.data);
};

export const createUsulan = (data) => {
  return adminApi.post("/usulan", data).then((res) => res.data);
};

export const updateUsulan = ({ id, data }) => {
  return adminApi.patch(`/usulan/${id}`, data).then((res) => res.data);
};

export const deleteUsulan = (id) => {
  return adminApi.delete(`/usulan/${id}`).then((res) => res.data);
};

export const findUsulanDetailByAdmin = (id, query) => {
  return adminApi
    .get(`/usulan/${id}/detail`, { params: query })
    .then((res) => res.data);
};

// user

export const findUsulanByUser = (query) => {
  return userApi.get("/usulan", { params: query }).then((res) => res.data);
};

export const findUsulanDetailByUser = (id, query) => {
  return userApi
    .get(`/usulan/${id}/detail`, { params: query })
    .then((res) => res.data);
};

export const createUsulanDetailByUser = ({ id, data }) => {
  return userApi.post(`/usulan/${id}/detail`, data).then((res) => res.data);
};

export const updateUsulanDetailByUser = ({ id, detailId, data }) => {
  return userApi
    .patch(`/usulan/${id}/detail/${detailId}`, data)
    .then((res) => res.data);
};

export const deleteUsulanDetailByUser = ({ id, detailId }) => {
  return userApi
    .delete(`/usulan/${id}/detail/${detailId}`)
    .then((res) => res.data);
};

export const uploadUsulanDetailByUser = ({ id, detailId, file }) => {
  return userApi
    .put(`/usulan/${id}/detail/${detailId}/upload`, file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export const findUsulanVerifUser = (id) => {
  return userApi.get(`/usulan/${id}/verif`).then((res) => res.data);
};

export const createUsulanVerifUser = ({ id, data }) => {
  return userApi.post(`/usulan/${id}/verif`, data).then((res) => res.data);
};

export const updateUsulanVerifUser = ({ id, verifId, data }) => {
  return userApi
    .patch(`/usulan/${id}/verif/${verifId}`, data)
    .then((res) => res.data);
};

export const deleteUsulanVerifUser = ({ id, verifId }) => {
  return userApi
    .delete(`/usulan/${id}/verif/${verifId}`)
    .then((res) => res.data);
};
