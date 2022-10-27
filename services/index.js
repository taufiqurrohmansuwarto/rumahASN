import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api",
});

export const createTickets = async (data) => {
  return await api.post("/tickets", data);
};

// just for admin only
export const createStatus = async (data) => {
  return await api.post("/ref/status", data).then((res) => res.data);
};

export const updateStatus = async ({ id, data }) => {
  return await api.patch(`/ref/status/${id}`, data).then((res) => res.data);
};

export const deleteStatus = async (id) => {
  return await api.delete(`/ref/status/${id}`).then((res) => res.data);
};

export const getStatus = async () => {
  return await api.get("/ref/status").then((res) => res.data);
};

// users
export const getUsers = async (query) => {
  // change query to querystring
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api.get(`/users?${qs}`).then((res) => res.data);
};

export const updateUsers = async (id, data) => {
  return await api.put(`/users/${id}`, data).then((res) => res.data);
};

// priorities
export const createPriority = async (data) => {
  return await api.post("/ref/priorities", data).then((res) => res.data);
};

export const updatePriority = async ({ id, data }) => {
  console.log(id, data);
  return await api.patch(`/ref/priorities/${id}`, data).then((res) => res.data);
};

export const deletePriority = async (id) => {
  return await api.delete(`/ref/priorities/${id}`).then((res) => res.data);
};

export const getPriorities = async () => {
  return await api.get("/ref/priorities").then((res) => res.data);
};

// categories
export const createCategory = async (data) => {
  return await api.post("/ref/categories", data).then((res) => res.data);
};

export const updateCategory = async ({ id, data }) => {
  return await api.patch(`/ref/categories/${id}`, data).then((res) => res.data);
};

export const deleteCategory = async (id) => {
  return await api.delete(`/ref/categories/${id}`).then((res) => res.data);
};

export const getCategories = async () => {
  return await api.get("/ref/categories").then((res) => res.data);
};

// data tree

export const getTreeOrganization = async () => {
  return await api.get("/data/departments").then((res) => res?.data);
};

// comments
export const getComments = async () => {
  return await api.get("/comments").then((res) => res.data);
};

export const createComment = async (data) => {
  return await api.post("/comments", data).then((res) => res.data);
};

export const updateComments = async ({ id, data }) => {
  return await api.patch(`/comments/${id}`, data).then((res) => res.data);
};

export const deleteComments = async (id) => {
  return await api.delete(`/comments/${id}`).then((res) => res.data);
};

export const detailComments = async (id) => {
  return await api.get(`/comments/${id}`).then((res) => res.data);
};

// list berita dan banner

export const dataListBerita = async () => {
  return await api.get("/berita").then((res) => res?.data);
};

export const dataListBanner = async () => {
  return await api.get("/banner").then((res) => res?.data);
};

export const listNotifications = async (simbol = "no") => {
  return await api
    .get(`/notifications?symbol=${simbol}`)
    .then((res) => res?.data);
};

export const clearChatsNotificatoins = async () => {
  return await api.put("/notifications").then((res) => res?.data);
};
