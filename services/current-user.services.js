import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/users",
});

export const currentUserRole = async () => {
  return api.get("/roles").then((res) => res?.data);
};
