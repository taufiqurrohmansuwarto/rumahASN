import axios from "axios";

const esignApi = axios.create({
  baseURL: "/helpdesk/api/esign/admin",
});

export const getTotpConfirmation = () => {
  return esignApi.post("/totp-confirmation").then((res) => res?.data);
};

export const getLastTotpConfirmation = () => {
  return esignApi.get("/totp-confirmation").then((res) => res?.data);
};

export const saveTotpConfirmation = (data) => {
  return esignApi.patch("/totp-confirmation", data).then((res) => res?.data);
};
