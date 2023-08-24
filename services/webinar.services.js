import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/webinar-series",
});

// admin
export const createWebinar = (data) => {
  return api.post(`/admin`, data).then((res) => res?.data);
};

export const detailWebinar = (id) => {
  return api.get(`/admin/${id}`).then((res) => res?.data);
};

export const readAllWebinar = (query) => {
  const queryStr = queryString.stringify(query);
  return api.get(`/admin?${queryStr}`).then((res) => res?.data);
};

export const updateWebinar = ({ id, data }) => {
  return api.patch(`/admin/${id}`, data).then((res) => res?.data);
};

export const removeWebinar = (id) => {
  return api.delete(`/admin/${id}`).then((res) => res?.data);
};

// user
export const readAllWebinarUser = (query) => {
  const queryStr = queryString.stringify(query);
  return api.get(`?${queryStr}`).then((res) => res?.data);
};

export const detailWebinarUser = (id) => {
  return api.get(`/${id}`).then((res) => res?.data);
};

export const registerWebinar = (id) => {
  return api.patch(`/${id}`).then((res) => res?.data);
};

export const unregisterWebinar = (id) => {
  return api.delete(`/${id}`).then((res) => res?.data);
};

export const uploadFileWebinar = ({ id, data }) => {
  return api
    .post(`/admin/${id}/upload`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res?.data);
};
