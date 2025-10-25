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

export const getPhone = async () => {
  return api.get(`/email/user/phone`).then((res) => res.data);
};
