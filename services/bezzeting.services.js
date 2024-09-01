import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/bezzeting",
});

export const fetchBezJf = async () => {
  return api.get("/admin/bezzeting-jf").then((res) => res?.data);
};

export const createBezJf = async (data) => {
  return api.post("/admin/bezzeting-jf", data).then((res) => res?.data);
};

export const updateBezJf = async ({ kode, data }) => {
  return api
    .patch(`/admin/bezzeting-jf/${kode}`, data)
    .then((res) => res?.data);
};

export const deleteBezJf = async (kode) => {
  return api.delete(`/admin/bezzeting-jf/${kode}`).then((res) => res?.data);
};

export const uploadBezzetingJF = async (file) => {
  return api
    .post(`/admin/bezzeting-jf/upload`, file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res?.data);
};
