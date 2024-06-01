const { getSession } = require("next-auth/react");
import { cariPnsKinerja } from "@/utils/siasn-proxy.utils";
import axios from "axios";

const apiGateway = process.env.APIGATEWAY_URL;

const refreshAttributeByNip = async (fetcher, attribute, nip) => {
  try {
    const result = await fetcher.get(
      `/siasn-ws/proxy/pns/refresh-${attribute}/${nip}`
    );

    const data = result?.data;

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// refresh golongan,jabatan, pendidikan, dan pernikahan
const refreshGolongan = async (req, res) => {
  try {
    const { employee_number: nip } = req?.user;
    const result = await refreshAttributeByNip(req.fetcher, "golongan", nip);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const refreshGolonganByNip = async (req, res) => {
  try {
    const { nip } = req.query;
    const result = await refreshAttributeByNip(req.fetcher, "golongan", nip);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const refreshJabatan = async (req, res) => {
  try {
    const { employee_number: nip } = req?.user;
    const result = await refreshAttributeByNip(req.fetcher, "jabatan", nip);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const refreshJabatanByNip = async (req, res) => {
  try {
    const { nip } = req.query;
    const result = await refreshAttributeByNip(req.fetcher, "jabatan", nip);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const refreshPendidikan = async (req, res) => {
  try {
    const { employee_number: nip } = req?.user;
    const result = await refreshAttributeByNip(req.fetcher, "pendidikan", nip);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const refreshPendidikanByNip = async (req, res) => {
  try {
    const { nip } = req.query;
    const result = await refreshAttributeByNip(req.fetcher, "pendidikan", nip);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const refreshPernikahan = async (req, res) => {
  try {
    const { employee_number: nip } = req?.user;
    const result = await refreshAttributeByNip(req.fetcher, "pernikahan", nip);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const refreshPernikahanByNip = async (req, res) => {
  try {
    const { nip } = req.query;
    const result = await refreshAttributeByNip(req.fetcher, "pernikahan", nip);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const cariPnsKinerjaProxy = async (req, res) => {
  try {
    const { nip } = req.query;
    const hasil = await getSession({ req });

    const token = hasil?.accessToken;

    console.log({
      apiGateway,
      token,
    });

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
  refreshGolongan,
  refreshGolonganByNip,
  refreshJabatan,
  refreshJabatanByNip,
  refreshPendidikan,
  refreshPendidikanByNip,
  refreshPernikahan,
  refreshPernikahanByNip,
};
