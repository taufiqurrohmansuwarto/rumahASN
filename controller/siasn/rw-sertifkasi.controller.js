import LogSiasn from "@/models/log-siasn.model";
import { handleError } from "@/utils/helper/controller-helper";
import { createLogSIASN } from "@/utils/logs";
import {
  dataUtama,
  getRwSertifikasi,
  postRwSertifikasi,
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
