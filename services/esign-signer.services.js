import axios from "axios";
import queryString from "query-string";

const esignApi = axios.create({
  baseURL: "/helpdesk/api/esign/signer",
});

export const getWebinars = async (query = {}) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return esignApi.get(`/certificates?${queryStr}`).then((res) => res?.data);
};
