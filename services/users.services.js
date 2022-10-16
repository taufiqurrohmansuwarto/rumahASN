import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/customers",
});

export const getAllTickets = async () => {
  return await api.get("/tickets").then((res) => res.data);
};

export const createTickets = async (data) => {
  return await api.post("/tickets", data);
};
