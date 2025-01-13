import esignFetcher from "./esign-fetcher";

const CHECK_NIK_URL = "/api/v2/user/check/status";

export const checkUserByNik = async (nik) => {
  try {
    const payload = { nik };
    const response = await esignFetcher.post(CHECK_NIK_URL, payload);
    return response;
  } catch (error) {
    console.log(error);
  }
};

