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

export const certificateDetailWebinar = async ({ id, query = {} }) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return esignApi
    .get(`/certificates/${id}?${queryStr}`)
    .then((res) => res?.data);
};

export const signCertificateByWebinarId = ({ data, id }) => {
  return esignApi.patch(`/certificates/${id}`, data).then((res) => res?.data);
};
