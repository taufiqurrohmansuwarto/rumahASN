import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/admins/redis",
});

export const getAllRedisKeys = async () => {
  return api.get("/").then((res) => res?.data);
};

export const getRedisKeyById = async (id) => {
  return api.get(`/${id}`).then((res) => res?.data);
};

export const deleteRedisKeyById = async (id) => {
  return api.delete(`/${id}`).then((res) => res?.data);
};

export const deleteAllRedisKeys = async () => {
  return api.delete("/").then((res) => res?.data);
};
