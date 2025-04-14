import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/siasn/bezzeting",
});

export const getBezzetingJf = async () => {
  return api.get("/fungsional").then((res) => res?.data);
};

export const syncBezzetingJf = async () => {
  return api.get("/fungsional/sync").then((res) => res?.data);
};
