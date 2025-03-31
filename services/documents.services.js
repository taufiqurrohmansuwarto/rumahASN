import axios from "axios";
import queryString from "query-string";

const userApi = axios.create({
  baseURL: "/helpdesk/api/documents",
});

export const getWebinarSeriesSigner = async (query) => {
  const qs = queryString.stringify(query);
  const url = `/webinars?${qs}`;
  return userApi.get(url).then((res) => res?.data);
};
