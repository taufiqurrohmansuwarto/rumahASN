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

export const bulkDelete = async (emailIds) => {
  return api.post(`/bulk-delete`, { emailIds }).then((res) => res?.data);
};

export const restoreEmail = async (emailId) => {
  return api.put(`/emails/${emailId}/delete`).then((res) => res?.data);
};

export const deleteEmail = async (emailId) => {
  return api.delete(`/emails/${emailId}/delete`).then((res) => res?.data);
};

export const sendEmail = async (data) => {
  return api.post("/emails", data).then((res) => res?.data);
};

// New functions for inbox
export const getInboxEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "inbox" })}`)
    .then((res) => res?.data);
};

export const getSentEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "sent" })}`)
    .then((res) => res?.data);
};

export const getDraftsEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "drafts" })}`)
    .then((res) => res?.data);
};

export const getTrashEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "trash" })}`)
    .then((res) => res?.data);
};

export const getArchiveEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "archive" })}`)
    .then((res) => res?.data);
};

export const getSpamEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "spam" })}`)
    .then((res) => res?.data);
};

export const getSnoozedEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "snoozed" })}`)
    .then((res) => res?.data);
};

export const getStarredEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "starred" })}`)
    .then((res) => res?.data);
};

export const getImportantEmails = async (params) => {
  return api
    .get(`/emails?${queryString.stringify({ ...params, folder: "important" })}`)
    .then((res) => res?.data);
};

export const getEmailById = async (emailId) => {
  return api.get(`/emails/${emailId}`).then((res) => res?.data);
};

export const markAsRead = async (emailId) => {
  return api
    .put(`/emails/${emailId}`, { action: "read" })
    .then((res) => res?.data);
};

export const markAsUnread = async (emailId) => {
  return api
    .put(`/emails/${emailId}`, { action: "unread" })
    .then((res) => res?.data);
};

export const toggleStar = async (emailId) => {
  return api
    .put(`/emails/${emailId}`, { action: "star" })
    .then((res) => res?.data);
};

export const moveToFolder = async (emailId, folder) => {
  return api
    .put(`/emails/${emailId}`, { action: "move", value: folder })
    .then((res) => res?.data);
};

export const searchEmails = async (params) => {
  return api
    .get(`/search?${queryString.stringify(params)}`)
    .then((res) => res?.data);
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

// search users
export const searchUsers = async (q) => {
  return api.get(`/search/users?q=${q}`).then((res) => res?.data);
};

// labels
export const getUserLabels = async () => {
  return api.get("/labels").then((res) => res?.data);
};

export const createLabel = async (data) => {
  return api.post("/labels", data).then((res) => res?.data);
};

export const deleteLabel = async (id) => {
  return api.delete(`/labels/${id}`).then((res) => res?.data);
};

export const updateLabel = async (id, data) => {
  return api.put(`/labels/${id}`, data).then((res) => res?.data);
};

// assign label to email
export const assignLabelToEmail = async (emailId, labelId) => {
  return api
    .post(`/emails/${emailId}/labels/${labelId}`)
    .then((res) => res?.data);
};

// get email labels
export const getEmailLabels = async (emailId) => {
  return api.get(`/emails/${emailId}/labels`).then((res) => res?.data);
};

// remove label from email
export const removeLabelFromEmail = async (emailId, labelId) => {
  return api
    .delete(`/emails/${emailId}/labels/${labelId}`)
    .then((res) => res?.data);
};

// ✅ TAMBAHKAN ACTION SERVICES
export const archiveEmail = async (emailId) => {
  return api
    .put(`/emails/${emailId}`, { action: "move", value: "archive" })
    .then((res) => res?.data);
};

export const markAsSpam = async (emailId) => {
  return api
    .put(`/emails/${emailId}`, { action: "move", value: "spam" })
    .then((res) => res?.data);
};

export const markAsNotSpam = async (emailId) => {
  return api
    .put(`/emails/${emailId}`, { action: "move", value: "inbox" })
    .then((res) => res?.data);
};
