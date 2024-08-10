import axios from "axios";
import queryString from "query-string";

const userApi = axios.create({
  baseURL: "/helpdesk/api/users",
});

const coachingClinicApi = axios.create({
  baseURL: "/helpdesk/api/coaching-clinic",
});

export const alterUserCoach = (id) => {
  const url = `/${id}/coaching`;
  return userApi.put(url);
};

export const dropUserCoach = (id) => {
  const url = `/${id}/coaching`;
  return userApi.delete(url);
};

export const checkStatus = () => {
  const url = "/consultants/status";
  return coachingClinicApi.get(url).then((res) => res.data);
};

// consultant / instructor
export const createMeeting = (data) => {
  const url = "/consultants/meetings";
  return coachingClinicApi.post(url, data).then((res) => res?.data);
};

export const findMeeting = (params) => {
  const qs = queryString.stringify(params);
  const url = `/consultants/meetings?${qs}`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const updateMeeting = ({ id, data }) => {
  const url = `/consultants/meetings/${id}`;
  return coachingClinicApi.patch(url, data).then((res) => res?.data);
};

export const removeMeeting = (id) => {
  const url = `/consultants/meetings/${id}`;
  return coachingClinicApi.delete(url).then((res) => res?.data);
};

export const detailMeeting = (id) => {
  const url = `/consultants/meetings/${id}`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const startMeeting = (id) => {
  const url = `/consultants/meetings/${id}/live`;
  return coachingClinicApi.put(url).then((res) => res?.data);
};

export const endMeeting = (id) => {
  const url = `/consultants/meetings/${id}/live`;
  return coachingClinicApi.delete(url).then((res) => res?.data);
};

// participants
export const upcomingMeetings = (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
  });
  const url = `/participants/upcoming?${qs}`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const searchMentoringByCode = (code) => {
  const url = `/participants/search-by-code?code=${code}`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const requestMeeting = (id) => {
  const url = `/participants/meetings/${id}/request`;
  return coachingClinicApi.put(url).then((res) => res?.data);
};

export const cancelRequestMeeting = (id) => {
  const url = `/participants/meetings/${id}/request`;
  return coachingClinicApi.delete(url).then((res) => res?.data);
};

export const meetingsParticipant = (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
  });

  const url = `/participants/me?${qs}`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const detailMeetingParticipant = (id) => {
  const url = `/participants/meetings/${id}`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const getRatingParticipant = (id) => {
  const url = `/participants/meetings/${id}/rating`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const giveRatingMeeting = ({ id, data }) => {
  const url = `/participants/meetings/${id}/rating`;
  return coachingClinicApi.put(url, data).then((res) => res?.data);
};

// tambah participants
export const addParticipant = ({ meetingId, data }) => {
  const url = `/consultants/meetings/${meetingId}/participants`;
  return coachingClinicApi.post(url, data).then((res) => res?.data);
};

export const removeParticipant = ({ meetingId, participantId }) => {
  const url = `/consultants/meetings/${meetingId}/participants/${participantId}`;
  return coachingClinicApi.delete(url).then((res) => res?.data);
};

export const ratingMeetingConsultant = async (id) => {
  const url = `/consultants/meetings/${id}/rating`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};
