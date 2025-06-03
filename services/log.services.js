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

export const logSIASNDashboard = async (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
  });

  return api.get(`/siasn/dashboard?${queryStr}`).then((res) => res?.data);
};

export const logBsre = (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
  });

  return api.get(`/bsre?${queryStr}`).then((res) => res?.data);
};

export const logBsreSeal = (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
  });

  return api.get(`/bsre-seal?${queryStr}`).then((res) => res?.data);
};

export const dataSealById = (id) => {
  return api.get(`/bsre-seal/${id}/data`).then((res) => res?.data);
};
