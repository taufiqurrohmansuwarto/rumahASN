import axios from "axios";
const FormData = require("form-data");

const baseURL = process.env.ESIGN_URL;
const username = process.env.ESIGN_USERNAME;
const password = process.env.ESIGN_PASSWORD;

const nik = process.env.ESIGN_NIK;
const passphrase = process.env.ESIGN_PASSPHRASE;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
      "base64"
    )}`,
  },
});

export const createSignature = async ({ file, imageTTD }) => {
  try {
    const formData = new FormData();
    formData.append("nik", nik);
    formData.append("passphrase", passphrase);
    formData.append("file", data.file);
    formData.append("width", 100);
    formData.append("height", 100);
    formData.append("tag_koordinat", "$");
    formData.append("ttd", imageTTD);
    formData.append("file", file);
    formData.append("tampilan", "VISIBLE");

    const response = await api.post("/api/sign/pdf", {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response?.data;
  } catch (error) {
    console.log(error);
  }
};
