import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/microservices",
});

export const ocrAnalyze = async (data) => {
  const response = await api.post("/ocr/analyze", data);
  return response.data;
};

export const ocrChangeBackground = async (data) => {
  const response = await api.post("/ocr/change-background", data);
  return response.data;
};

export const ocrRemoveBackground = async (data) => {
  const response = await api.post("/ocr/remove-background", data);
  return response.data;
};
