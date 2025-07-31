import { handleError } from "@/utils/helper/controller-helper";
import { createLogSIASN } from "@/utils/logs";
import {
  dataUtama,
  getRwSertifikasi,
  postRwSertifikasi,
  removeSertifikasi,
} from "@/utils/siasn-utils";

export const getSertifikasiByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { nip } = req?.query;

    const result = await getRwSertifikasi(request, nip);
    const data = result?.data;
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSertifikasPersonal = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;
    const result = await getRwSertifikasi(request, nip);
    const data = result?.data;
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

/**{
  "gelarBelakangSert": "string",
  "gelarDepanSert": "string",
  "id": "string",
  "lembagaSertifikasiId": "string",
  "lembagaSertifikasiNama": "string",
  "masaBerlakuSertMulai": "string",
  "masaBerlakuSertSelasai": "string",
  "namaSertifikasi": "string",
  "nomorSertifikat": "string",
  "path": [
    {
      "dok_id": "string",
      "dok_nama": "string",
      "dok_uri": "string",
      "object": "string",
      "slug": "string"
    }
  ],
  "pnsOrangId": "string",
  "rumpunJabatanId": "string",
  "tanggalSertifikat": "string"
} */

export const createSertifikasiByNip = async (req, res) => {
  try {
    const { siasnRequest: request, user } = req;
    const { nip } = req?.query;
    const payload = req?.body;
    const currentUser = await dataUtama(request, nip);
    const pnsOrangId = currentUser?.id;
    const currentPayload = {
      ...payload,
      pnsOrangId,
    };

    const result = await postRwSertifikasi(request, currentPayload);

    await createLogSIASN({
      userId: user?.customId,
      type: "create-sertifikasi",
      siasnService: "rw-sertifikasi",
      employeeNumber: nip,
      request_data: JSON.stringify(currentPayload),
    });

    res.json({
      id: result?.mapData?.rwSertifikasiId,
      message: "Sertifikasi berhasil ditambahkan",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const createSertifikasiPersonal = async (req, res) => {
  try {
    const { siasnRequest: request, user } = req;
    const { employee_number: nip } = req?.user;
    const payload = req?.body;
    const currentUser = await dataUtama(request, nip);
    const pnsOrangId = currentUser?.id;
    const currentPayload = {
      ...payload,
      pnsOrangId,
    };

    console.log(currentPayload);

    const result = await postRwSertifikasi(request, currentPayload);

    res.json({
      id: result?.mapData?.rwSertifikasiId,
      message: "Sertifikasi berhasil ditambahkan",
    });

    await createLogSIASN({
      userId: user?.customId,
      type: "create-sertifikasi",
      siasnService: "rw-sertifikasi",
      employeeNumber: nip,
      request_data: JSON.stringify(currentPayload),
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteSertifikasiByNip = async (req, res) => {
  try {
    const { id, nip } = req?.query;
    const user = req?.user;

    console.log({ nip, id });

    const { siasnRequest: request } = req;
    await removeSertifikasi(request, id);

    await createLogSIASN({
      userId: user?.customId,
      type: "delete-sertifikasi",
      siasnService: "rw-sertifikasi",
      employeeNumber: nip,
      request_data: JSON.stringify({ nip, id }),
    });

    res.json({
      message: "Sertifikasi berhasil dihapus",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteSertifikasiPersonal = async (req, res) => {
  try {
    const { siasnRequest: request, user } = req;
    const { employee_number: nip } = req?.user;
    const { id } = req?.query;

    await removeSertifikasi(request, id);

    await createLogSIASN({
      userId: user?.customId,
      type: "delete-sertifikasi",
      siasnService: "rw-sertifikasi",
      employeeNumber: nip,
    });

    res.json({
      message: "Sertifikasi berhasil dihapus",
    });
  } catch (error) {
    handleError(res, error);
  }
};
