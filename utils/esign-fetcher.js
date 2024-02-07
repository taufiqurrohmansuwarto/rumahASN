const { default: axios } = require("axios");

const baseURL = process.env.ESIGN_URL;
const username = process.env.ESIGN_USERNAME;
const password = process.env.ESIGN_PASSWORD;

const esignFetcher = axios.create({
  baseURL,
  headers: {
    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
      "base64"
    )}`,
  },
});

esignFetcher.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const data = error?.response?.data;
    return Promise.reject(data);
  }
);

module.exports = esignFetcher;
