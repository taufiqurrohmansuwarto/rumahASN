import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/anomali",
});

// anomali 2023
export const uploadDataAnomali2023 = async (data) => {
  return api
    .post(`/2023/admin/upload`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res?.data);
};

// baru
export const anomaliUserByNip = async (nip) => {
  return api
    .get(`/2023/admin/users?employee_number=${nip}`)
    .then((res) => res?.data);
};

export const updateAnomaliUserByNip = async ({ employee_number, data }) => {
  return api
    .patch(`/2023/admin/users?employee_number=${employee_number}`, data)
    .then((res) => res?.data);
};

export const daftarAnomali23 = async (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
  });
  return api.get(`/2023/admin?${queryStr}`).then((res) => res?.data);
};

export const getUserAnomali2023 = async () => {
  return api.get(`/2023/user`).then((res) => res?.data);
};

export const patchAnomaliUser2023 = async ({ id, data }) => {
  return api.patch(`/2023/user/${id}`, data).then((res) => res?.data);
};

export const patchAnomali2023 = async ({ id, data }) => {
  return api.patch(`/2023/admin/${id}`, data).then((res) => res?.data);
};

export const downloadAnomali2023 = async () => {
  return api
    .get(`/2023/admin/upload`, {
      responseType: "arraybuffer",
    })
    .then((res) => res?.data);
};

export const aggregateAnomali2023 = async () => {
  return api.get(`/2023/admin/aggregate`).then((res) => res?.data);
};

// anomali untuk user
export const downloadDataAnomaliFasilitator = async () => {
  return api
    .get(`/2023/fasilitator/download`, {
      responseType: "arraybuffer",
    })
    .then((res) => res?.data);
};

export const dataAdminByDate = async (query) => {
  return api.get(`/2023/admin/by-date?date=${query}`).then((res) => res?.data);
};
