import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/netralitas",
});

export const createLapor = (data) => {
  return api
    .post(`/lapor`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res?.data);
};
