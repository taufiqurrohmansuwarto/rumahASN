import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/fasilitator-employees/usulan",
});

// kppi
export const kppi = async () => {
  const res = await api.get(`/kppi`);
  return res?.data;
};
