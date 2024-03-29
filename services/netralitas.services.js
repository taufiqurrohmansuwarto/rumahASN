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

export const getNetralitasASN = () => {
  return api.get(`/admin/`).then((res) => res?.data);
};

export const searchByKodeNetralitas = ({ kode, captcha }) => {
  return api
    .put(`/lapor/${kode}`, {
      captcha,
    })
    .then((res) => res?.data);
};
