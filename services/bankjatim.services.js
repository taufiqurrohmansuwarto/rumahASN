import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/partners/bankjatim",
});

export const pingKoneksi = () => {
  return api.post("/ping").then((res) => res?.data);
};

export const pengajuanKredit = (data) => {
  return api.post("/loans/apply", data).then((res) => res?.data);
};

export const cekPeminjamanKredit = (data) => {
  return api.post("/loans/check", data).then((res) => res?.data);
};

export const simulasiKredit = (data) => {
  return api.post("/loans/simulasi", data).then((res) => res?.data);
};

export const historiesKredit = (data) => {
  return api.post("/loans/histories", data).then((res) => res?.data);
};

export const localHistories = ({ page, limit, sort }) => {
  const query = queryString.stringify(
    {
      page,
      limit,
      sort,
    },
    {
      skipNull: true,
      skipEmptyString: true,
      skipEmptyObject: true,
      skipUndefined: true,
    }
  );

  return api.get(`/loans/local-histories?${query}`).then((res) => res?.data);
};
