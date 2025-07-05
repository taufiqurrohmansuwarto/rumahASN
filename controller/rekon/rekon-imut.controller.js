import { handleError } from "@/utils/helper/controller-helper";
import queryString from "query-string";
import { listImut } from "@/utils/siasn-utils";

const INSTANSI_ID = "A5EB03E23CCCF6A0E040640A040252AD";
const JENIS_ID = null;
const KATEGORY_ID = null;
const SUB_JENIS_ID = null;

export const getImut = async (req, res) => {
  try {
    const {
      nip,
      kategori_id,
      jenis_id,
      sub_jenis_id,
      limit = 10,
      offset = 0,
    } = req.query;

    const { siasnRequest: fetcher } = req;
    const payloadQuery = {
      instansi_id: INSTANSI_ID || "",
      nip: nip || "",
      kategori: kategori_id || "",
      jenis: jenis_id || "",
      sub_jenis: sub_jenis_id || "",
      limit: limit?.toString() || "10",
      offset: offset?.toString() || "0",
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
