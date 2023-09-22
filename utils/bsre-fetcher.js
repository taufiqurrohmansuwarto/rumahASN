import axios from "axios";
import { createLogBsre } from "./logs";
const FormData = require("form-data");
const qrCode = require("qrcode");

const baseURL = process.env.ESIGN_URL;
const username = process.env.ESIGN_USERNAME;
const password = process.env.ESIGN_PASSWORD;

const nik = process.env.ESIGN_NIK;
const passphrase = process.env.ESIGN_PASSPHRASE;

const webinar_certificate_url = process.env.WEBINAR_CERTIFICATE_URL;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
      "base64"
    )}`,
  },
});

export const createSignature = async ({ id, file, userId }) => {
  try {
    const formData = new FormData();

    // generate qr code to buffer
    const qr = `${webinar_certificate_url}/${id}}`;

    const currentQrCode = await qrCode.toBuffer(qr);

    formData.append("nik", nik);
    formData.append("passphrase", passphrase);
    formData.append("width", 60);
    formData.append("image", "true");
    formData.append("height", 60);
    formData.append("tag_koordinat", "$");
    formData.append("imageTTD", Buffer.from(currentQrCode), "qr-code.png");
    formData.append("file", Buffer.from(file), "file.pdf");
    formData.append("tampilan", "VISIBLE");

    formData.append("jenis_response", "BASE64");

    const response = await api.post("/api/sign/pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: true,
      data: response?.data,
    };
  } catch (error) {
    console.log(error);
    await createLogBsre({
      userId,
      webinarParticipantId: id,
      log: JSON.stringify(error?.response?.data),
    });
    return {
      success: false,
      data: error?.response?.data,
    };
  }
};
