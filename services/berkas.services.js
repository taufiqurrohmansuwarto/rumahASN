import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/asn/documents",
});

export const checkDocument = (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api.get(`/check?${params}`).then((res) => res?.data);
};

export const downloadDocument = (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api.get(`/download?${params}`).then((res) => res?.data);
};
