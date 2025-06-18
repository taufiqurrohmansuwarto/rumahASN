import {
  cekPeminjamanKredit,
  historiesKredit,
  pengajuanKredit,
  pingKoneksi,
  simulasiKredit,
} from "@/utils/bank-jatim.utils";
import { createLog } from "@/utils/logs";

// Helper function untuk menangani error response
const handleErrorResponse = (error) => {
  let errorMessage = "";
  const message = error?.response?.data?.message || "Internal server error";
  if (Array.isArray(message)) {
    errorMessage = message.map((item) => item.message).join(", ");
  } else {
    errorMessage = message;
  }
  return errorMessage;
};

// Helper function untuk membuat log payload
const createLogPayload = (user, ip, requestBody, responseBody, endpoint) => {
  return {
    user_id: user?.customId,
    ip,
    request_body: JSON.stringify(requestBody) || "",
    response_body: JSON.stringify(responseBody) || "",
    services: "bankjatim",
    endpoint,
  };
};

// Helper function untuk menangani success response dengan logging
const handleSuccessWithLog = async (
  result,
  req,
  endpoint,
  res,
  returnData = false
) => {
  const { user, ip } = req;
  const payload = createLogPayload(user, ip, req?.body, result, endpoint);
  await createLog(payload);

  res.json(result);
};

// Helper function untuk menangani error dengan logging
const handleErrorWithLog = (error, res, shouldLog = true) => {
  if (shouldLog) {
    console.log(error);
  }
  const errorMessage = handleErrorResponse(error);
  res.status(500).json({ message: errorMessage });
};

export const ping = async (req, res) => {
  try {
    const { fetcher } = req;
    const result = await pingKoneksi(fetcher);
    await handleSuccessWithLog(result?.data, req, "/ping", res);
  } catch (error) {
    handleErrorWithLog(error, res);
  }
};

export const pengajuan = async (req, res) => {
  try {
    const { fetcher, body } = req;
    const result = await pengajuanKredit(fetcher, body);
    console.log(body);
    console.log(result?.data);
    await handleSuccessWithLog(result?.data, req, "/pengajuan", res);
    // Override response untuk mengembalikan data saja
  } catch (error) {
    handleErrorWithLog(error, res);
  }
};

export const cekPeminjaman = async (req, res) => {
  try {
    const { fetcher, body } = req;
    const result = await cekPeminjamanKredit(fetcher, body);
    await handleSuccessWithLog(result?.data, req, "/cek-peminjaman", res, true);
  } catch (error) {
    handleErrorWithLog(error, res);
  }
};

export const simulasi = async (req, res) => {
  try {
    const { fetcher, body } = req;
    const result = await simulasiKredit(fetcher, body);
    await handleSuccessWithLog(result?.data, req, "/simulasi", res, true);
  } catch (error) {
    handleErrorWithLog(error, res, false);
  }
};

export const histories = async (req, res) => {
  try {
    const { fetcher, user } = req;
    const { employee_number: nip } = user;
    const payload = { nip };
    const result = await historiesKredit(fetcher, payload);
    await handleSuccessWithLog(result?.data, req, "/histories", res, true);
  } catch (error) {
    handleErrorWithLog(error, res, false);
  }
};
