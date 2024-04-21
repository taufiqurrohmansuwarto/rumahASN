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

// exhibitors
export const eventExhibitors = (eventId) => {
  return api.get(`/admin/all/${eventId}/exhibitors`).then((res) => res?.data);
};

export const createEventExhibitors = ({ eventId, data }) => {
  return api
    .post(`/admin/all/${eventId}/exhibitors`, data)
    .then((res) => res?.data);
};

export const updateEventExhibitors = ({ eventId, id, data }) => {
  return api
    .patch(`/admin/all/${eventId}/exhibitors/${id}`, data)
    .then((res) => res?.data);
};

export const deleteEventExhibitors = ({ eventId, id }) => {
  return api
    .delete(`/admin/all/${eventId}/exhibitors/${id}`)
    .then((res) => res?.data);
};

// sponsors
export const eventSponsors = (eventId) => {
  return api.get(`/admin/all/${eventId}/sponsors`).then((res) => res?.data);
};

export const createEventSponsors = ({ eventId, data }) => {
  return api
    .post(`/admin/all/${eventId}/sponsors`, data)
    .then((res) => res?.data);
};

export const updateEventSponsors = ({ eventId, id, data }) => {
  return api
    .patch(`/admin/all/${eventId}/sponsors/${id}`, data)
    .then((res) => res?.data);
};

export const deleteEventSponsors = ({ eventId, id }) => {
  return api
    .delete(`/admin/all/${eventId}/sponsors/${id}`)
    .then((res) => res?.data);
};

// messages
export const eventMessages = (eventId) => {
  return api.get(`/admin/all/${eventId}/messages`).then((res) => res?.data);
};

export const createEventMessages = ({ eventId, data }) => {
  return api
    .post(`/admin/all/${eventId}/messages`, data)
    .then((res) => res?.data);
};

export const updateEventMessages = ({ eventId, id, data }) => {
  return api
    .patch(`/admin/all/${eventId}/messages/${id}`, data)
    .then((res) => res?.data);
};

export const deleteEventMessages = ({ eventId, id }) => {
  return api
    .delete(`/admin/all/${eventId}/messages/${id}`)
    .then((res) => res?.data);
};

// participants
export const eventParticipants = (eventId) => {
  return api.get(`/admin/all/${eventId}/participants`).then((res) => res?.data);
};

export const createEventParticipants = ({ eventId, data }) => {
  return api
    .post(`/admin/all/${eventId}/participants`, data)
    .then((res) => res?.data);
};

export const updateEventParticipants = ({ eventId, id, data }) => {
  return api
    .patch(`/admin/all/${eventId}/participants/${id}`, data)
    .then((res) => res?.data);
};

export const deleteEventParticipants = ({ eventId, id }) => {
  return api
    .delete(`/admin/all/${eventId}/participants/${id}`)
    .then((res) => res?.data);
};

// speakers
export const eventSpeakers = (eventId) => {
  return api.get(`/admin/all/${eventId}/speakers`).then((res) => res?.data);
};

export const createEventSpeakers = ({ eventId, data }) => {
  return api
    .post(`/admin/all/${eventId}/speakers`, data)
    .then((res) => res?.data);
};

export const updateEventSpeakers = ({ eventId, id, data }) => {
  return api
    .patch(`/admin/all/${eventId}/speakers/${id}`, data)
    .then((res) => res?.data);
};

export const deleteEventSpeakers = ({ eventId, id }) => {
  return api
    .delete(`/admin/all/${eventId}/speakers/${id}`)
    .then((res) => res?.data);
};

// materials
export const eventMaterials = (eventId) => {
  return api.get(`/admin/all/${eventId}/materials`).then((res) => res?.data);
};

export const createEventMaterials = ({ eventId, data }) => {
  return api
    .post(`/admin/all/${eventId}/materials`, data)
    .then((res) => res?.data);
};

export const updateEventMaterials = ({ eventId, id, data }) => {
  return api
    .patch(`/admin/all/${eventId}/materials/${id}`, data)
    .then((res) => res?.data);
};

export const deleteEventMaterials = ({ eventId, id }) => {
  return api
    .delete(`/admin/all/${eventId}/materials/${id}`)
    .then((res) => res?.data);
};

// maps
export const eventMaps = (eventId) => {
  return api.get(`/admin/all/${eventId}/maps`).then((res) => res?.data);
};

export const createEventMaps = ({ eventId, data }) => {
  return api.post(`/admin/all/${eventId}/maps`, data).then((res) => res?.data);
};

export const updateEventMaps = ({ eventId, id, data }) => {
  return api
    .patch(`/admin/all/${eventId}/maps/${id}`, data)
    .then((res) => res?.data);
};

export const deleteEventMaps = ({ eventId, id }) => {
  return api
    .delete(`/admin/all/${eventId}/maps/${id}`)
    .then((res) => res?.data);
};

export const userEvents = () => {
  return api.get(`/user`).then((res) => res?.data);
};
