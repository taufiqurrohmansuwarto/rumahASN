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

export const downloadTicketBKD = (params) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
  });

  return api
    .get(`/bkd-employees/tickets/download?${queryParams}`, {
      responseType: "arraybuffer",
    })
    .then((res) => res?.data);
};

export const statistikPegawaiBKD = () => {
  return api.get(`/bkd-employees/tickets/statistics`).then((res) => res?.data);
};
