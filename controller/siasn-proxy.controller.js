const { getSession } = require("next-auth/react");
import { cariPnsKinerja } from "@/utils/siasn-proxy.utils";
import axios from "axios";

const apiGateway = process.env.APIGATEWAY_URL;

const cariPnsKinerjaProxy = async (req, res) => {
  try {
    const { nip } = req.query;
    const hasil = await getSession({ req });

    const fetcher = axios.create({
      baseURL: apiGateway,
      headers: {
        Authorization: `Bearer ${hasil?.accessToken}`,
      },
    });

    const result = await cariPnsKinerja(fetcher, nip);

    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

module.exports = {
  cariPnsKinerjaProxy,
};
