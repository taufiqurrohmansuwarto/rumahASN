import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/kominfo-submissions",
});

export const createEmailSubmission = async (data) => {
  return api.post("/email/user/submissions", data).then((res) => res.data);
};

export const listEmailSubmission = async () => {
  return api.get(`/email/user/submissions`).then((res) => res.data);
};

export const checkEmailJatimprov = async () => {
  return api.get(`/email/user/check`).then((res) => res.data);
};

// admin
export const listEmailSubmissionAdmin = async ({
  search = "",
  page = 1,
  limit = 10,
  status = "DIAJUKAN",
}) => {
  const params = queryString.stringify(
    { search, page, limit, status },
    { skipNull: true, skipEmptyString: true }
  );
  return api.get(`/email/admin/submissions?${params}`).then((res) => res.data);
};

export const updateEmailSubmissionAdmin = async ({ id, data }) => {
  return api
    .patch(`/email/admin/submissions/${id}`, data)
    .then((res) => res.data);
};

export const listEmailJatimprovPegawaiAdmin = async ({
  search = "",
  page = 1,
  limit = 10,
}) => {
  const params = queryString.stringify(
    { search, page, limit },
    { skipNull: true, skipEmptyString: true }
  );
  return api
    .get(`/email/admin/jatimprov-mails?${params}`)
    .then((res) => res.data);
};

export const uploadEmailJatimprovExcel = async (formData) => {
  return api
    .post(`/email/admin/jatimprov-mails/upload`, formData)
    .then((res) => res.data);
};

export const createEmailJatimprovPegawaiAdmin = async (data) => {
  return api.post(`/email/admin/jatimprov-mails`, data).then((res) => res.data);
};

export const updateEmailJatimprovPegawaiAdmin = async (id, data) => {
  return api
    .patch(`/email/admin/jatimprov-mails/${id}`, data)
    .then((res) => res.data);
};

export const deleteEmailJatimprovPegawaiAdmin = async (id) => {
  return api
    .delete(`/email/admin/jatimprov-mails/${id}`)
    .then((res) => res.data);
};

export const getPhone = async () => {
  return api.get(`/email/user/phone`).then((res) => res.data);
};

// tanda tangan elektronik
export const checkTTE = async () => {
  return api.get(`/tte/user/check-tte`).then((res) => res.data);
};

export const createPengajuanTTE = async (data) => {
  return api.post(`/tte/user/tte`, data).then((res) => res.data);
};

export const getPengajuanTTE = async () => {
  return api.get(`/tte/user/tte`).then((res) => res.data);
};

export const getPengajuanTTEById = async (id) => {
  return api.get(`/tte/user/tte/${id}`).then((res) => res.data);
};

export const uploadFilePengajuanTTE = async (id, formData) => {
  return api
    .post(`/tte/user/tte/${id}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export const submitPengajuanTTE = async (id) => {
  return api.post(`/tte/user/tte/${id}/submit`).then((res) => res.data);
};

export const getDokumenTTE = async () => {
  return api.get(`/tte/user/document`).then((res) => res.data);
};

export const uploadFileFromUrl = async (id, data) => {
  return api
    .post(`/tte/user/tte/${id}/upload-from-url`, data)
    .then((res) => res.data);
};

export const listPengajuanTTEAdmin = async (params) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });
  return api
    .get(`/tte/admin/submissions?${queryParams}`)
    .then((res) => res.data);
};

export const updatePengajuanTTEAdmin = async (id, data) => {
  return api
    .patch(`/tte/admin/submissions/${id}`, data)
    .then((res) => res.data);
};

export const flushDataPengajuan = async () => {
  return api.post(`/flush`).then((res) => res.data);
};
