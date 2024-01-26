import axios from "axios";

const esignApi = axios.create({
  baseURL: "/helpdesk/api/esign",
});

export const checkUser = () => {
  return esignApi.get("/check").then((res) => res?.data);
};
