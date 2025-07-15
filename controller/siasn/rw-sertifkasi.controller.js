import { handleError } from "@/utils/helper/controller-helper";
import { getRwSertifikasi } from "@/utils/siasn-utils";

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

export const createSertifikasiByNip = async (req, res) => {
  try {
    const { nip } = req?.query;
    const result = await getRwSertifikasi(nip);
    const data = result?.data;
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};
