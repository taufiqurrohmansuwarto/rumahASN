import axios from "axios";
import { createLogBsre } from "./logs";
const FormData = require("form-data");
const qrCode = require("qrcode");

const baseURL = process.env.ESIGN_URL;
const username = process.env.ESIGN_USERNAME;
const password = process.env.ESIGN_PASSWORD;

const isProduction = process.env.NODE_ENV === "production";

const nik = process.env.ESIGN_NIK;
const passphrase = process.env.ESIGN_PASSPHRASE;

const webinar_certificate_url = isProduction
  ? "https://siasn.bkd.jatimprov.go.id/helpdesk/certificates/webinar"
  : "http://localhost:3088/helpdesk/certificates/webinar";

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
    const qr = `${webinar_certificate_url}/${id}`;

    const currentQrCode = await qrCode.toBuffer(qr, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 1,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

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

    await createLogBsre({
      userId,
      webinarParticipantId: id,
      log: JSON.stringify(response?.data),
      status: "success",
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
      status: "error",
    });
    return {
      success: false,
      data: error?.response?.data,
    };
  }
};

export const createQrFromId = async (id) => {
  try {
    const qr = `${webinar_certificate_url}/${id}`;

    const currentQrCode = await qrCode.toBuffer(qr, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 1,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    const currentBuffer = Buffer.from(currentQrCode).toString("base64");

    return currentBuffer;
  } catch (error) {
    console.log(error);
  }
};
