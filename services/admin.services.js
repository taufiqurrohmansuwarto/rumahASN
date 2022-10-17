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
export const pickAgents = async () => {};
