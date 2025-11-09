import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/ref",
});

export const getFaqQna = async (query) => {
  const currentQuery = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });
  return api.get(`/faq-qna?${currentQuery}`).then((res) => res?.data);
};

export const createFaqQna = async (data) => {
  return api.post("/faq-qna", data).then((res) => res?.data);
};

export const updateFaqQna = async ({ id, data }) => {
  return api.patch(`/faq-qna/${id}`, data).then((res) => res?.data);
};

export const deleteFaqQna = async (id) => {
  return api.delete(`/faq-qna/${id}`).then((res) => res?.data);
};

export const getFaqQnaById = async (id) => {
  return api.get(`/faq-qna/${id}`).then((res) => res?.data);
};

export const askFaqQna = async (data) => {
  return api.post("/faq-qna/ask", data).then((res) => res?.data);
};

export const getFaqQnaHistory = async (id) => {
  return api.get(`/faq-qna/${id}/history`).then((res) => res?.data);
};

export const bulkSyncFaqQna = async (query = {}) => {
  const currentQuery = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });
  return api
    .post(`/faq-qna/bulk-sync?${currentQuery}`)
    .then((res) => res?.data);
};

export const getFaqQnaHealth = async () => {
  return api.get("/faq-qna/health").then((res) => res?.data);
};

export const resyncFaqQna = async (id) => {
  return api.post(`/faq-qna/${id}/resync`).then((res) => res?.data);
};
