import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/discussions",
});

export const threads = () => api.get("/threads").then((res) => res.data);
export const thread = (id) => api.get(`/threads/${id}`).then((res) => res.data);
export const createThread = (data) =>
  api.post("/threads", data).then((res) => res.data);
export const updateThread = ({ id, data }) =>
  api.patch(`/threads/${id}`, data).then((res) => res.data);

export const removeThread = (id) =>
  api.delete(`/threads/${id}`).then((res) => res.data);
