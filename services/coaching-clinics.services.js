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
