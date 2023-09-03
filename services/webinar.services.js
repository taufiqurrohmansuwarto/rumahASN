import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/webinar-series",
});

// all
export const allWebinars = (query) => {
  const queryStr = queryString.stringify(query);
  return api.get(`/all?${queryStr}`).then((res) => res?.data);
};

// admin
export const createWebinar = (data) => {
  return api.post(`/admin`, data).then((res) => res?.data);
};

export const getParticipants = ({ id, query }) => {
  const queryStr = queryString.stringify(query);
  return api
    .get(`/admin/${id}/participants?${queryStr}`)
    .then((res) => res?.data);
};

export const detailWebinar = (id) => {
  return api.get(`/admin/${id}`).then((res) => res?.data);
};

export const readAllWebinar = (query) => {
  const queryStr = queryString.stringify(query);
  return api.get(`/admin?${queryStr}`).then((res) => res?.data);
};

export const updateWebinar = ({ id, data }) => {
  return api.patch(`/admin/${id}`, data).then((res) => res?.data);
};

export const removeWebinar = (id) => {
  return api.delete(`/admin/${id}`).then((res) => res?.data);
};

// user
export const readAllWebinarUser = (query) => {
  const queryStr = queryString.stringify(query);
  return api.get(`/all?${queryStr}`).then((res) => res?.data);
};

export const detailAllWebinar = (id) => {
  return api.get(`/all/${id}`).then((res) => res?.data);
};

export const detailWebinarUser = (id) => {
  return api.get(`/${id}`).then((res) => res?.data);
};

export const registerWebinar = (id) => {
  return api.patch(`/all/${id}/participates`).then((res) => res?.data);
};

export const unregisterWebinar = (id) => {
  return api.delete(`/all/${id}/participates`).then((res) => res?.data);
};

export const uploadFileWebinar = ({ id, data }) => {
  return api
    .post(`/admin/${id}/upload`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res?.data);
};

// user webinar
export const webinarUser = async (query) => {
  const queryStr = queryString.stringify(query);
  return api.get(`/users?${queryStr}`).then((res) => res?.data);
};

export const webinarUserDetail = async (id) => {
  return api.get(`/users/${id}`).then((res) => res?.data);
};

export const downloadCurrentUserCertificate = async (id) => {
  return api
    .get(`/users/${id}/download`, {
      responseType: "arraybuffer",
    })
    .then((res) => res?.data);
};

// surveys admin
export const createSurvey = (data) => {
  return api.post(`/admin/surveys`, data).then((res) => res?.data);
};

export const readAllSurvey = (query) => {
  const queryStr = queryString.stringify(query);
  return api.get(`/admin/surveys?${queryStr}`).then((res) => res?.data);
};

export const detailSurvey = (id) => {
  return api.get(`/admin/surveys/${id}`).then((res) => res?.data);
};

export const updateSurvey = ({ id, data }) => {
  return api.patch(`/admin/surveys/${id}`, data).then((res) => res?.data);
};

export const deleteSurvey = (id) => {
  return api.delete(`/admin/surveys/${id}`).then((res) => res?.data);
};

// surveys user
export const readAllSurveyUser = (id) => {
  return api.get(`/users/${id}/surveys`).then((res) => res?.data);
};

export const submitSurveys = ({ id, data }) => {
  return api.post(`/users/${id}/surveys`, data).then((res) => res?.data);
};
