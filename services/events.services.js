import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/asn/events",
});

export const getEvents = (query) => {
  const params = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });

  return api.get(`/admin/all?${params}`).then((res) => res?.data);
};

export const createEvents = (data) => {
  return api.post("/admin/all", data).then((res) => res?.data);
};

export const getEvent = (id) => {
  return api.get(`/admin/all/${id}`).then((res) => res?.data);
};

export const updateEvent = ({ id, data }) => {
  return api.patch(`/admin/all/${id}`, data).then((res) => res?.data);
};

export const deleteEvent = (id) => {
  return api.delete(`/admin/all/${id}`).then((res) => res?.data);
};

export const userEvents = () => {
  return api.get(`/user`).then((res) => res?.data);
};
