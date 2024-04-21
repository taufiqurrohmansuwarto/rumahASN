import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/asn/events",
});

// admin role
export const getEvents = (params) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api.get(`admin/all?${query}`).then((res) => res.data);
};

export const createEvent = (data) => {
  return api.post("/admin/all", data).then((res) => res.data);
};
