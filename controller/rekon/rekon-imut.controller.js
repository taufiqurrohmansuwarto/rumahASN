import { handleError } from "@/utils/helper/controller-helper";
import queryString from "query-string";
import { listImut } from "@/utils/siasn-utils";

const INSTANSI_ID = "A5EB03E23CCCF6A0E040640A040252AD";

export const getImut = async (req, res) => {
  try {
    const { limit = 10, offset = 0, no_surat_usulan = "" } = req.query;

    const { siasnRequest: fetcher } = req;
    const payloadQuery = {
      instansi_id: INSTANSI_ID || "",
      limit: limit?.toString() || "10",
      offset: offset?.toString() || "0",
      no_surat_usulan: no_surat_usulan || "",
    };

    const query = queryString.stringify(payloadQuery, {
      skipNull: false,
      skipEmptyString: false,
    });

    const imut = await listImut(fetcher, query);
    const data = imut?.data;
    res.status(200).json(data);
  } catch (error) {
    handleError(res, error);
  }
};
