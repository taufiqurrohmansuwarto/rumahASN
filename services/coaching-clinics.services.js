import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/coaching-clinics",
});

// crud for specializations
export const getSpecializations = async (params) => {
  const queryParams = queryString.stringify(params);
  const res = await api.get(`/specializations?${queryParams}`);
  return res.data;
};

export const getSpecialization = async (id) => {
  const res = await api.get(`/specializations/${id}`);
  return res.data;
};

export const createSpecialization = async (data) => {
  const res = await api.post(`/specializations`, data);
  return res.data;
};

export const updateSpecialization = async ({ id, data }) => {
  const res = await api.put(`/specializations/${id}`, data);
  return res.data;
};

export const deleteSpecialization = async (id) => {
  const res = await api.delete(`/specializations/${id}`);
  return res.data;
};

// add remove consultants
export const addConsultant = async (data) => {
  const res = await api.post(`/consultants`, data);
  return res.data;
};

export const removeConsultant = async (id) => {
  const res = await api.delete(`/consultants/${id}`);
  return res.data;
};

// add spesialization to consultant
export const addSpecializationToConsultant = async (data) => {
  const res = await api.post(`/specializations`, data);
  return res.data;
};

// meeting for consultant
export const createMeeting = async (data) => {
  const res = await api.post(`/meetings`, data);
  return res.data;
};

export const getMeetings = async (params) => {
  const queryParams = queryString.stringify(params);
  const res = await api.get(`/meetings?${queryParams}`);
  return res.data;
};

export const detailMeeting = async (id) => {
  const res = await api.get(`/meetings/${id}`);
  return res.data;
};

export const updateMeeting = async ({ id, data }) => {
  const res = await api.patch(`/meetings/${id}`, data);
  return res.data;
};

export const deleteMeeting = async (id) => {
  const res = await api.delete(`/meetings/${id}`);
  return res.data;
};

export const startMeeting = async (id) => {
  const res = await api.post(`/meetings/${id}/start`);
  return res.data;
};

export const endMeeting = async (id) => {
  const res = await api.post(`/meetings/${id}/end`);
  return res.data;
};

// participant
export const joinMeeting = async (data) => {
  const res = await api.post(`/participants`, data);
  return res.data;
};

export const leaveMeeting = async (id) => {
  const res = await api.delete(`/participants/${id}`);
  return res.data;
};
