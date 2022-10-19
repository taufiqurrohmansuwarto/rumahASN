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

export const assignAgents = async ({ id, data }) => {
  return api.post(`/ticket-agents/${id}`, data).then((res) => res?.data);
};
