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

export const daftarAnomali23 = async (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
  });
  return api.get(`/2023/admin?${queryStr}`).then((res) => res?.data);
};

export const getUserAnomali2023 = async () => {
  return api.get(`/2023/user`).then((res) => res?.data);
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
