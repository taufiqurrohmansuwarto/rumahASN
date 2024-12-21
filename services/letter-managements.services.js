import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/letter-managements",
});

export const getHeaderSurat = async (query) => {
  const qs = query ? `?${queryString.stringify(query)}` : "";
  return api.get(`/headers${qs}`).then((res) => res.data);
};

export const createHeaderSurat = async (data) => {
  return api.post("/headers", data).then((res) => res.data);
};

export const updateHeaderSurat = async ({ id, data }) => {
  return api.patch(`/headers/${id}`, data).then((res) => res.data);
};

export const deleteHeaderSurat = async (id) => {
  return api.delete(`/headers/${id}`).then((res) => res.data);
};
