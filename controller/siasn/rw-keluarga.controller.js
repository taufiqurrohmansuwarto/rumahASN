import { handleError } from "@/utils/helper/controller-helper";
const { tambahAnak, tambahPasangan, anak } = require("@/utils/siasn-utils");

const getAnak = async (fetcher, nip) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await anak(fetcher, nip);
      resolve(result);
    } catch (error) {
      const dataTidakDitemkan =
        error?.code === 0 || error?.data === "Data tidak ditemukan";
      if (dataTidakDitemkan) {
        resolve([]);
      } else {
        reject(error);
      }
    }
  });
};

export const dataAnakByNip = async (req, res) => {
  try {
    const { nip } = req?.query;
    const { siasnRequest } = req;
    const result = await getAnak(siasnRequest, nip);
    const data = result?.data?.data?.listAnak;
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const postAnakByNip = async (req, res) => {
  try {
    const { nip } = req?.query;
    const { siasnRequest } = req;
    const body = req?.body;
    const { data } = body;
    await tambahAnak(siasnRequest, data);

    res.json({
      code: 200,
      message: "Berhasil menambahkan anak",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const postIstriByNip = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const postAnakPersonal = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const postIstriPersonal = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};
