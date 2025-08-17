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
