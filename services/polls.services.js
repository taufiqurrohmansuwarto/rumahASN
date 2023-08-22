import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/polls",
});

export const createPolling = (data) => {
  return api.post(`/admin`, data).then((res) => res?.data);
};

export const readAllPolling = () => {
  return api.get(`/admin`).then((res) => res?.data);
};

export const detailPolling = (id, query = "simple") => {
  return api.get(`/admin/${id}?detail=${query}`).then((res) => res?.data);
};

export const updatePolling = ({ id, data }) => {
  return api.patch(`/admin/${id}`, data).then((res) => res?.data);
};

export const removePooling = (id) => {
  return api.delete(`/admin/${id}`).then((res) => res?.data);
};

export const pollForUser = () => {
  return api.get(``).then((res) => res?.data);
};

// user
export const votePolling = (data) => {
  return api.patch(``, data).then((res) => res?.data);
};
