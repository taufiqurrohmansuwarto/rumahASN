import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api",
});

export const pegawaiBkdTickets = (params) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
  });

  return api
    .get(`/bkd-employees/tickets?${queryParams}`)
    .then((res) => res?.data);
};
