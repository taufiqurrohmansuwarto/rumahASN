import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/guests-books",
});

export const getUser = () => {
  return api.get("/user").then((res) => res.data);
};

export const updateUser = (data) => {
  return api.patch("/user", data).then((res) => res.data);
};

export const getScheduleVisits = (query) => {
  const qs = query ? `?${queryString.stringify(query)}` : "";
  return api.get(`/user/schedule-visits${qs}`).then((res) => res.data);
};

export const createScheduleVisit = (data) => {
  return api.post("/user/schedule-visits", data).then((res) => res.data);
};

export const getScheduleVisitById = (id) => {
  return api.get(`/user/schedule-visits/${id}`).then((res) => res.data);
};

export const updateScheduleVisit = ({ id, data }) => {
  return api.patch(`/user/schedule-visits/${id}`, data).then((res) => res.data);
};

export const deleteScheduleVisit = (id) => {
  return api.delete(`/user/schedule-visits/${id}`).then((res) => res.data);
};

export const getEmployeesBKD = () => {
  return api.get("/employees").then((res) => res.data);
};

export const getAllScheduleVisits = (query) => {
  const qs = query ? `?${queryString.stringify(query)}` : "";
  return api.get(`/admin/schedule-visits${qs}`).then((res) => res.data);
};

export const checkIn = (data) => {
  return api.post("/admin/checkin", data).then((res) => res.data);
};

export const checkOut = (data) => {
  return api.post("/admin/checkout", data).then((res) => res.data);
};

export const getMyGuest = (query) => {
  const qs = query ? `?${queryString.stringify(query)}` : "";
  return api.get(`/admin/my-guest${qs}`).then((res) => res.data);
};

export const findByQrCode = async (data) => {
  return api.post(`/admin/qr-code`, data).then((res) => res.data);
};

export const findCheckIn = async (query) => {
  const qs = query ? `?${queryString.stringify(query)}` : "";
  return api.get(`/admin/checkin${qs}`).then((res) => res.data);
};

export const findCheckOut = async (query) => {
  const qs = query ? `?${queryString.stringify(query)}` : "";
  return api.get(`/admin/checkout${qs}`).then((res) => res.data);
};
