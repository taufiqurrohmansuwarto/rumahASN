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

//files references crud
export const createSubmissionsFileRefs = async (data) => {
  return api.post(`/admin/files`, data).then((res) => res?.data);
};

export const updateSubmissionsFileRefs = async ({ id, data }) => {
  return api.patch(`/admin/files/${id}`, data).then((res) => res?.data);
};

export const detailSubmissionsFileRefs = async (id) => {
  return api.get(`/admin/files/${id}`).then((res) => res?.data);
};

export const deleteSubmissionsFileRefs = async (id) => {
  return api.delete(`/admin/files/${id}`).then((res) => res?.data);
};

export const getSubmissionsFileRefs = async (params) => {
  return api
    .get(`/admin/files?${queryString.stringify(params)}`)
    .then((res) => res?.data);
};

// submission with files
export const createSubmissionWithFiles = async ({ id, data }) => {
  return api
    .post(`/admin/references/${id}/files`, data)
    .then((res) => res?.data);
};

export const detailSubmissionWithFiles = async ({ id, fileId }) => {
  return api
    .get(`/admin/references/${id}/files/${fileId}`)
    .then((res) => res?.data);
};

export const deleteSubmissionWithFiles = async ({ id, fileId }) => {
  return api
    .delete(`/admin/references/${id}/files/${fileId}`)
    .then((res) => res?.data);
};

export const updateSubmissionWithFiles = async ({ id, data }) => {
  return api
    .patch(`/admin/references/${id}/files`, data)
    .then((res) => res?.data);
};

export const getSubmissionWithFiles = async (id) => {
  return api.get(`/admin/references/${id}/files`).then((res) => res?.data);
};

// submitter
export const submissionsSubmitter = async () => {
  return api.get(`/submitter/submissions`).then((res) => res?.data);
};

export const detailSubmissionSubmitter = async (id) => {
  return api.get(`/submitter/submissions/${id}`).then((res) => res?.data);
};

export const createSubmissionSubmitter = async (data) => {
  return api.post(`/submitter/my-submission`, data).then((res) => res?.data);
};

export const getAllSubmissionSubmitter = async (query) => {
  return api
    .get(
      `/submitter/my-submission?${queryString.stringify(query, {
        skipEmptyString: true,
        skipNull: true,
      })}`
    )
    .then((res) => res?.data);
};

export const detailSubmissionSubmitters = async (id) => {
  return api.get(`/submitter/my-submission/${id}`).then((res) => res?.data);
};

export const uploadSubmitter = async ({ id, data }) => {
  return api
    .post(`/submitter/my-submission/${id}/upload`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res?.data);
};
