const { default: axios } = require("axios");

const api = axios.create({
  baseURL: "/helpdesk/api/public",
});

export const publicUnorAsn = async () => {
  return api.get("/pendataan-fasilitator/unor").then((res) => res.data);
};

export const getPegawaiByNip = async (nip) => {
  return api
    .get(`/pendataan-fasilitator/cari-pegawai/${nip}`)
    .then((res) => res.data);
};

export const postPendataan = async (payload) => {
  return api
    .post("/pendataan-fasilitator/pendataan", payload)
    .then((res) => res?.data);
};
