import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/discussions",
});

// threads
export const threads = () => api.get("/threads").then((res) => res.data);

export const thread = (id) => api.get(`/threads/${id}`).then((res) => res.data);

export const createThread = (data) =>
  api.post("/threads", data).then((res) => res.data);

export const updateThread = ({ id, data }) =>
  api.patch(`/threads/${id}`, data).then((res) => res.data);

export const removeThread = (id) =>
  api.delete(`/threads/${id}`).then((res) => res.data);

// posts
export const posts = (threadId) =>
  api.get(`/posts?threadId=${threadId}`).then((res) => res.data);

export const post = (id) => api.get(`/posts/${id}`).then((res) => res.data);

export const createPost = ({ threadId, data }) =>
  api.post(`/posts?threadId=${threadId}`, data).then((res) => res.data);

export const updatePost = ({ id, data }) =>
  api.patch(`/posts/${id}`, data).then((res) => res.data);

export const removePost = (id) =>
  api.delete(`/posts/${id}`).then((res) => res.data);

// comments
