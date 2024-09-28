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

export const getScheduleVisits = () => {
  return api.get("/user/schedule-visits").then((res) => res.data);
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

export const getAllScheduleVisits = () => {
  return api.get("/admin/schedule-visits").then((res) => res.data);
};

export const checkIn = (data) => {
  return api.post("/admin/checkin", data).then((res) => res.data);
};

export const checkOut = (data) => {
  return api.post("/admin/checkout", data).then((res) => res.data);
};

export const getMyGuest = () => {
  return api.get("/admin/my-guest").then((res) => res.data);
};
