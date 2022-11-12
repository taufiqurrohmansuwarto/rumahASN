import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/admins",
});

export const getAllTickets = async (query) => {
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

export const listAgents = async () => {
  return api.get(`/agents`).then((res) => res?.data);
};

// agents
export const assignAgents = async ({ id, data }) => {
  return api.patch(`/ticket-agents/${id}`, data).then((res) => res?.data);
};

export const removeAgents = async (id) => {
  return api.delete(`/ticket-agents/${id}`).then((res) => res?.data);
};

export const adminDashboard = async () => {
  return api.get(`/dashboard`).then((res) => res?.data);
};

export const excelReport = async () => {
  return api.get(`/reports`).then((res) => res?.data);
};

export const commentsCustomersToAgents = async (id) => {
  return api.get(`/tickets/${id}/comments-customers`).then((res) => res?.data);
};
