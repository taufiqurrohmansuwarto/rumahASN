import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/public",
});

export const verifyPdfService = (data) => {
  return api.post(`/verify-pdf`, data).then((res) => res?.data);
};
