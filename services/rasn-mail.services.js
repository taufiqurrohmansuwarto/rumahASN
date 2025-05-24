import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/rasn-mail",
});

export const getEmailStats = async () => {
  return api.get("/stats").then((res) => res?.data);
};

export const getTrash = async (userId) => {
  return api
    .get(`/trash?${queryString.stringify({ userId })}`)
    .then((res) => res?.data);
};

export const deleteTrash = async (userId) => {
  return api
    .delete(`/trash?${queryString.stringify({ userId })}`)
    .then((res) => res?.data);
};

export const emptyTrash = async (userId) => {
  return api
    .delete(`/trash/empty?${queryString.stringify({ userId })}`)
    .then((res) => res?.data);
};

export const bulkDelete = async (userId, emailIds) => {
  return api
    .post(`/bulk-delete?${queryString.stringify({ userId })}`, { emailIds })
    .then((res) => res?.data);
};

export const restoreEmail = async (userId, emailId) => {
  return api
    .put(`/restore?${queryString.stringify({ userId, emailId })}`)
    .then((res) => res?.data);
};

export const deleteEmail = async (userId, emailId) => {
  return api
    .delete(`/delete?${queryString.stringify({ userId, emailId })}`)
    .then((res) => res?.data);
};

export const sendEmail = async (data) => {
  return api.post("/email", data).then((res) => res?.data);
};

// drafts

// save draft
export const saveDraft = async (data) => {
  return api.post("/drafts", data).then((res) => res?.data);
};

// udpate draft
export const updateDraft = async ({ id, data }) => {
  return api.put(`/drafts/${id}`, data).then((res) => res?.data);
};

// delete draft
export const deleteDraft = async (id) => {
  return api.delete(`/drafts/${id}`).then((res) => res?.data);
};

// get draft
export const getDraft = async (id) => {
  return api.get(`/drafts/${id}`).then((res) => res?.data);
};

// send draft
export const sendDraft = async (id) => {
  return api.post(`/drafts/${id}/send`).then((res) => res?.data);
};
