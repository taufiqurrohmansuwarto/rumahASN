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
