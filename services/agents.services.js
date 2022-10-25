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

export const kerjakanTicket = (id) => {
  return api.patch(`/tickets/${id}`).then((res) => res?.data);
};

export const hapusKerjakanTicket = (id) => {
  return api.delete(`/tickets/${id}`).then((res) => res?.data);
};
