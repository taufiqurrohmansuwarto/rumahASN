import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/customers",
});

export const getAllTickets = async (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api.get(`/tickets?${qs}`).then((res) => res.data);
};

export const createTickets = async (data) => {
  return await api.post("/tickets", data);
};

export const deleteTicket = async (id) => {
  return await api.delete(`/tickets/${id}`).then((res) => res.data);
};

export const detailTicket = async (id) => {
  return await api.get(`/tickets/${id}`).then((res) => res.data);
};

// messages customers to agents
export const getCommentCustomers = async (id) => {
  return await api
    .get(`/tickets/${id}/comments-customers`)
    .then((res) => res.data);
};

export const removeCommentCustomers = async ({ id, ticketId }) => {
  return await api
    .delete(`/tickets/${ticketId}/comments-customers/${id}`)
    .then((res) => res?.data);
};

export const updateCommentCustomers = async ({ id, ticketId, data }) => {
  return await api
    .patch(`/tickets/${ticketId}/comments-customers/${id}`, data)
    .then((res) => res?.data);
};

export const createCommentCustomers = async ({ id, data }) => {
  return await api
    .post(`/tickets/${id}/comments-customers`, data)
    .then((res) => res?.data);
};

// give fucking feedback
export const sendFeedbackData = async ({ id, data }) => {
  return await api
    .patch(`/tickets/${id}/feedback`, data)
    .then((res) => res?.data);
};

export const customerDashboard = async () => {
  return await api.get("/dashboard").then((res) => res.data);
};
