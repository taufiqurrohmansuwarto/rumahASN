import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/knowledge",
});

export const getKnowledgeContents = async (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api.get(`/users/contents?${qs}`).then((res) => res.data);
};

export const getKnowledgeContent = async (id) => {
  return await api.get(`/users/contents/${id}`).then((res) => res.data);
};

export const createKnowledgeContent = async (data) => {
  return await api.post("/users/contents", data).then((res) => res.data);
};

export const updateKnowledgeContent = async ({ id, data }) => {
  return await api.patch(`/users/contents/${id}`, data).then((res) => res.data);
};

export const deleteKnowledgeContent = async (id) => {
  return await api.delete(`/users/contents/${id}`).then((res) => res.data);
};

export const getKnowledgeCategories = async () => {
  return await api.get("/users/refs/categories").then((res) => res.data);
};

// user interactions
export const likeKnowledgeContent = async (id) => {
  return await api.post(`/users/contents/${id}/likes`).then((res) => res.data);
};

export const getKnowledgeContentComments = async (id) => {
  return await api
    .get(`/users/contents/${id}/comments`)
    .then((res) => res.data);
};

export const createKnowledgeContentComment = async ({ id, data }) => {
  return await api
    .post(`/users/contents/${id}/comments`, data)
    .then((res) => res.data);
};

export const deleteKnowledgeContentComment = async ({ id, commentId }) => {
  return await api
    .delete(`/users/contents/${id}/comments/${commentId}`)
    .then((res) => res.data);
};

export const updateKnowledgeContentComment = async ({
  id,
  commentId,
  data,
}) => {
  return await api
    .patch(`/users/contents/${id}/comments/${commentId}`, data)
    .then((res) => res.data);
};

export const bookmarkKnowledgeContent = async (id) => {
  return await api
    .post(`/users/contents/${id}/bookmarks`)
    .then((res) => res.data);
};
