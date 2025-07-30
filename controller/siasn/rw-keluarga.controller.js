import { handleError } from "@/utils/helper/controller-helper";
import { createLogSIASN } from "@/utils/logs";
import { isEmpty } from "lodash";
const { tambahAnak, tambahPasangan, anak } = require("@/utils/siasn-utils");
const SiasnEmployees = require("@/models/siasn-employees.model");

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

    const result = await tambahAnak(siasnRequest, data);

    await createLogSIASN({
      userId: req?.user?.customId,
      type: "CREATE",
      employeeNumber: nip,
      siasnService: "anak",
    });

    const response = result?.data;

    if (response?.success) {
      res.json({
        code: 200,
        message: response?.message,
      });
    } else {
      res.json({
        code: 400,
        message: response?.message,
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const postPasanganByNip = async (req, res) => {
  try {
    const { nip } = req?.query;
    const { siasnRequest } = req;
    const data = req?.body;

    const pegawaId = await SiasnEmployees.query()
      .where("nip_baru", nip)
      .whereNotIn("kedudukan_hukum_id", ["71", "72"])
      .first();

    if (!pegawaId) {
      res.status(400).json({
        code: 400,
        message: "Pegawai tidak ditemukan/pegawai bukan PNS",
      });
    } else {
      let payload = {
        ...data,
        jenisIdentitas: "1",
        pnsOrangId: pegawaId?.pns_id,
      };

      const pasangan = await SiasnEmployees.query()
        .whereILike("nik", `%${data?.nomorIdentitas}%`)
        .first();

      if (pasangan) {
        payload = {
          ...payload,
          statusPekerjaanPasangan: "PNS",
          agamaId: pasangan?.agama_id,
          nama: pasangan?.nama,
          alamat: pasangan?.alamat,
          email: pasangan?.email,
          tglLahir: pasangan?.tanggal_lahir,
          noHp: pasangan?.nomor_hp,
        };
      } else {
        payload = {
          ...payload,
          statusPekerjaanPasangan: "Non PNS",
        };
      }

      const result = await tambahPasangan(siasnRequest, payload);
      const response = result?.data;
      const success =
        response?.success === true || response?.success === "true";

      if (success) {
        await createLogSIASN({
          userId: req?.user?.customId,
          type: "CREATE",
          employeeNumber: nip,
          siasnService: "pasangan",
        });

        res.status(200).json({
          code: 200,
          message: response?.message,
        });
      } else {
        res.status(400).json({
          code: 400,
          message: response?.message,
        });
      }
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const postAnakPersonal = async (req, res) => {
  try {
    const { employee_number: nip } = req?.user;
    const { siasnRequest } = req;
    const body = req?.body;
    const { data } = body;

    const result = await tambahAnak(siasnRequest, data);

    await createLogSIASN({
      userId: req?.user?.customId,
      type: "CREATE",
      employeeNumber: nip,
      siasnService: "anak",
    });

    const response = result?.data;

    if (response?.success) {
      res.json({
        code: 200,
        message: response?.message,
      });
    } else {
      res.json({
        code: 400,
        message: response?.message,
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const postIstriPersonal = async (req, res) => {
  try {
    const { employee_number: nip } = req?.user;
    const { siasnRequest } = req;
    const data = req?.body;

    const pegawaId = await SiasnEmployees.query()
      .where("nip_baru", nip)
      .whereNotIn("kedudukan_hukum_id", ["71", "72"])
      .first();

    if (!pegawaId) {
      res.status(400).json({
        code: 400,
        message: "Pegawai tidak ditemukan/pegawai bukan PNS",
      });
    } else {
      let payload = {
        ...data,
        jenisIdentitas: "1",
        pnsOrangId: pegawaId?.pns_id,
      };

      const pasangan = await SiasnEmployees.query()
        .whereILike("nik", `%${data?.nomorIdentitas}%`)
        .first();

      if (pasangan) {
        payload = {
          ...payload,
          statusPekerjaanPasangan: "PNS",
          agamaId: pasangan?.agama_id,
          nama: pasangan?.nama,
          alamat: pasangan?.alamat,
          email: pasangan?.email,
          tglLahir: pasangan?.tanggal_lahir,
          noHp: pasangan?.nomor_hp,
        };
      } else {
        payload = {
          ...payload,
          statusPekerjaanPasangan: "Non PNS",
        };
      }

      const result = await tambahPasangan(siasnRequest, payload);
      const response = result?.data;
      const success =
        response?.success === true || response?.success === "true";

      if (success) {
        await createLogSIASN({
          userId: req?.user?.customId,
          type: "CREATE",
          employeeNumber: nip,
          siasnService: "pasangan",
        });

        res.status(200).json({
          code: 200,
          message: response?.message,
        });
      } else {
        res.status(400).json({
          code: 400,
          message: response?.message,
        });
      }
    }
  } catch (error) {
    handleError(res, error);
  }
};
