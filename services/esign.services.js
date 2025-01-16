import axios from "axios";

const esignApi = axios.create({
  baseURL: "/helpdesk/api/documents",
});

export const checkUser = () => {
  return esignApi.get("/check").then((res) => res?.data);
};

export const signPdf = ({ passphrase }) => {
  return esignApi.post("/sign", { passphrase });
};
