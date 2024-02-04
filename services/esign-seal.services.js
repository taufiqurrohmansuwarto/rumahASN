import axios from "axios";

const esignApi = axios.create({
  baseURL: "/helpdesk/api/esign/seal",
});

export const generateSealActivation = () => {
  return esignApi.patch("/activation").then((res) => res?.data);
};

export const detailSubscriber = () => {
  return esignApi.get("/subscriber").then((res) => res?.data);
};

export const setSubscriberId = (data) => {
  return esignApi.patch("/subscriber", data).then((res) => res?.data);
};

export const setTotpActivationCode = (data) => {
  return esignApi.patch("/totp", data).then((res) => res?.data);
};
