import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/submissions",
});

export const createSubmissionReference = async (data) => {
  return api.post("/admin/references", data).then((res) => res?.data);
};

export const getSubmissionReference = async () => {
  return api.get(`/admin/references`).then((res) => res?.data);
};

export const detailSubmissionReference = async (id) => {
  return api.get(`/admin/references/${id}`).then((res) => res?.data);
};

export const updateSubmissionReference = async ({ id, data }) => {
  return api.patch(`/admin/references/${id}`, data).then((res) => res?.data);
};

export const deleteSubmissionReference = async (id) => {
  return api.delete(`/admin/references/${id}`).then((res) => res?.data);
};

// person in charge
export const createSubmissionPersonInCharge = async ({ id, data }) => {
  return api
    .post(`/admin/references/${id}/person-in-charge`, data)
    .then((res) => res?.data);
};

export const detailSubmissionPersonInCharge = async ({ id, picId }) => {
  return api
    .get(`/admin/references/${id}/person-in-charge/${picId}`)
    .then((res) => res?.data);
};

export const updateSubmissionPersonInCharge = async ({ id, picId, data }) => {
  return api
    .patch(`/admin/references/${id}/person-in-charge/${picId}`, data)
    .then((res) => res?.data);
};

export const getSubmissionPersonInCharge = async (id) => {
  return api
    .get(`/admin/references/${id}/person-in-charge`)
    .then((res) => res?.data);
};

export const deleteSubmissionPersonInCharge = async ({ id, picId }) => {
  return api
    .delete(`/admin/references/${id}/person-in-charge/${picId}`)
    .then((res) => res?.data);
};
