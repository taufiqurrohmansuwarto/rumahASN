const { default: axios } = require("axios");
const OCR_API_URL = process.env.OCR_API_URL;

const api = axios.create({
  baseURL: OCR_API_URL,
});

// health
export const checkHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

// analyze image
export const analyzeImage = async (data) => {
  const response = await api.post("/analyze", data);
  return response.data;
};

// remove background
export const removeBackground = async (data) => {
  const response = await api.post("/remove-background", data);
  return response.data;
};

// change background
export const changeBackground = async (data) => {
  const response = await api.post("/change-background", data);
  return response.data;
};
