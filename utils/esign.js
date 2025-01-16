import { uploadMinioWithFolder } from ".";
import esignFetcher from "./esign-fetcher";

const CHECK_NIK_URL = "/api/v2/user/check/status";
const SIGN_PDF_URL = "/api/v2/sign/pdf";

export const checkUserByNik = async (nik, employeeNumber) => {
  try {
    const payload = { nik };
    const response = await esignFetcher.post(CHECK_NIK_URL, payload);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const signPdfWithPassphrase = async (nik, passphrase, pdfBase64) => {
  return new Promise(async (resolve, reject) => {
    try {
      const payload = {
        nik,
        passphrase,
        signatureProperties: [
          {
            tampilan: "INVISIBLE",
            page: 1,
            location: null,
            reason: null,
          },
        ],
        file: [pdfBase64],
      };

      const response = await esignFetcher.post(SIGN_PDF_URL, payload);
      resolve(response);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const signAndSaveToMinio = async ({
  mc,
  url,
  name,
  nik,
  passphrase,
}) => {
  return new Promise(async (resolve, reject) => {
    console.log({ url, name, nik, passphrase });
    try {
      const pdfResponse = await axios.get(url, { responseType: "arraybuffer" });
      const pdfBase64 = Buffer.from(pdfResponse.data).toString("base64");
      const response = await signPdfWithPassphrase(nik, passphrase, pdfBase64);
      const file = response?.data?.file[0];
      await uploadMinioWithFolder(mc, name, file, "public");
      resolve({ success: true });
    } catch (error) {
      console.log("error di esign", error);
      resolve({ success: false });
    }
  });
};
