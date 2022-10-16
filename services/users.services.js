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
