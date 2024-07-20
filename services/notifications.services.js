import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/notifications",
});

export const getNotifactionsAsnConnect = (symbol = "no") => {
  return api.get(`/asn-connect?symbol=${symbol}`).then((res) => res.data);
};

export const clearNotifactionsAsnConnect = () => {
  return api.put("/asn-connect");
};

export const readNotifactionsAsnConnect = (id) => {
  return api.put(`/asn-connect/${id}`);
};
