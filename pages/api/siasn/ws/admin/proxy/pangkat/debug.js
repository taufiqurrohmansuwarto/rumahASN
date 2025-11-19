import { verifyAuth } from "@/middleware/verify-auth";
import { log } from "@/utils/logger";

const PangkatProxy = require("@/models/siasn-proxy/pangkat-proxy.model");

const handler = async (req, res) => {
  try {
    const { id, nip } = req.query;

    if (!id && !nip) {
      return res.status(400).json({
        message: "id atau nip harus diisi",
      });
    }

    let query = PangkatProxy.query();

    if (id) {
      query = query.where("id", id);
    } else if (nip) {
      query = query.where("nip", "ilike", `%${nip}%`);
    }

    const results = await query;

    log.info(
      `Debug endpoint called: id=${id}, nip=${nip}, found=${results.length}`
    );

    res.json({
      success: true,
      found: results.length,
      data: results,
    });
  } catch (error) {
    log.error("Error in debug endpoint", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default verifyAuth(handler);
