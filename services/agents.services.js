import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/agents",
});

export const getAllTickets = (query) => {
  return api
    .get(
      `/tickets?${queryString.stringify(query, {
        skipNull: true,
        skipEmptyString: true,
      })}`
    )
    .then((res) => res?.data);
};

export const detailTicket = (id) => {
  return api.get(`/tickets/${id}`).then((res) => res?.data);
};

export const updatePropertyTicket = ({ id, data }) => {
  return api.patch(`/tickets/${id}/properties`, data).then((res) => res?.data);
};

export const kerjakanTicket = (id) => {
  return api.patch(`/tickets/${id}`).then((res) => res?.data);
};

export const hapusKerjakanTicket = (id) => {
  return api.delete(`/tickets/${id}`).then((res) => res?.data);
};

// akhiri pekerjaan
export const akhiriPekerjaanSelesai = ({ id, data }) => {
  return api.patch(`/tickets/${id}/status`, data).then((res) => res?.data);
};

export const akhirPekerjaanTidakSelesai = (id) => {
  return api.delete(`/tickets/${id}/status`).then((res) => res?.data);
};

// for agent to agents message
export const messagesAgents = async (id) => {
  return await api
    .get(`/tickets/${id}/comments-agents`)
    .then((res) => res.data);
};

export const createMessagesAgents = async ({ id, data }) => {
  return await api
    .post(`/tickets/${id}/comments-agents`, data)
    .then((res) => res.data);
};

export const deleteMessagesAgents = async ({ id, ticketId }) => {
  return await api
    .delete(`/tickets/${ticketId}/comments-agents/${id}`)
    .then((res) => res.data);
};

export const detailMessagesAgents = async ({ id, ticketId }) => {
  return await api
    .get(`/tickets/${ticketId}/comments-agents/${id}`)
    .then((res) => res.data);
};

export const updateMessagesAgents = async ({ id, ticketId, data }) => {
  return await api
    .patch(`/tickets/${ticketId}/comments-agents/${id}`, data)
    .then((res) => res.data);
};

// for agent to customer message
export const messagesCustomers = async (id) => {
  return await api
    .get(`/tickets/${id}/comments-customers`)
    .then((res) => res.data);
};

export const createMessagesCustomers = async ({ id, data }) => {
  return await api
    .post(`/tickets/${id}/comments-customers`, data)
    .then((res) => res.data);
};

export const deleteMessagesCustomers = async ({ id, ticketId }) => {
  return await api
    .delete(`/tickets/${ticketId}/comments-customers/${id}`)
    .then((res) => res.data);
};

export const detailMessagesCustomers = async ({ id, ticketId }) => {
  return await api
    .get(`/tickets/${ticketId}/comments-customers/${id}`)
    .then((res) => res.data);
};

export const updateMessagesCustomers = async ({ id, ticketId, data }) => {
  return await api
    .patch(`/tickets/${ticketId}/comments-customers/${id}`, data)
    .then((res) => res.data);
};

export const dashboardAgents = async () => {
  return await api.get("/dashboard").then((res) => res.data);
};

// saved replies
export const savedReplies = async (req, res) => {
  return await api.get("/saved-replies").then((res) => res.data);
};

export const createSavedReplies = async (data) => {
  return await api.post("/saved-replies", data).then((res) => res.data);
};

export const deleteSavedReplies = async (id) => {
  return await api.delete(`/saved-replies/${id}`).then((res) => res.data);
};

export const detailSavedReplies = async (id) => {
  return await api.get(`/saved-replies/${id}`).then((res) => res.data);
};

export const updateSavedReplies = async ({ id, data }) => {
  return await api.patch(`/saved-replies/${id}`, data).then((res) => res.data);
};
