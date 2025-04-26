import { handleError } from "@/utils/helper/controller-helper";
import queryString from "query-string";
import { listImut } from "@/utils/siasn-utils";

const INSTANSI_ID = "A5EB03E23CCCF6A0E040640A040252AD";
const JENIS_ID = 40;
const KATEGORY_ID = 1;
const SUB_JENIS_ID = 402;

export const getImut = async (req, res) => {
  try {
    const {
      nip,
      instansi_id,
      kategory,
      jenis,
      sub_jenis,
      limit = 10,
      offset = 0,
    } = req.query;
    const { siasnRequest: fetcher } = req;
    const query = queryString.stringify(
      {
        nip,
        instansi_id: instansi_id || INSTANSI_ID,
        kategory: kategory || KATEGORY_ID,
        jenis: jenis || JENIS_ID,
        sub_jenis: sub_jenis || SUB_JENIS_ID,
        limit: limit || 10,
        offset,
      },
      {
        skipNull: true,
        skipEmptyString: true,
      }
    );
    const imut = await listImut(fetcher, query);
    const data = imut?.data;
    res.status(200).json(data);
  } catch (error) {
    handleError(res, error);
  }
};
