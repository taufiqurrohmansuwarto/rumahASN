import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/asesor-ai",
});

// verbatim
export const uploadRekamanVerbatim = async (payload) => {
  return api
    .post("/verbatim/upload", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export const getRekamanVerbatim = async () => {
  return api.get("/verbatim").then((res) => res.data);
};

export const getAudioVerbatim = async (id) => {
  return api.get(`/verbatim/${id}/audio`).then((res) => res.data);
};

export const transribeAudioVerbatim = async ({ id, audioId }) => {
  return api
    .post(`/verbatim/${id}/audio/${audioId}/transribe`)
    .then((res) => res.data);
};
