import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/asn/dashboard",
});

export const dashboarAsnConnect = () => {
  return api.get(`/`).then((res) => res?.data);
};
