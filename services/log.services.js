import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/logs",
});

export const logSIASN = (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
  });

  return api.get(`/siasn?${queryStr}`).then((res) => res?.data);
};

export const logBsre = (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
  });

  return api.get(`/bsre?${queryStr}`).then((res) => res?.data);
};
