const { createLogSIASN } = require("@/utils/logs");

const fetcherSyncJabatanGolongan = (fetcher, nip, routes) => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentData = await fetcher.get(`/pns/data-utama/${nip}`);
      const currentPns = currentData?.data?.data;
      const url = `/pns/${routes}?pns_orang_id=${currentPns?.id}`;
      const result = await fetcher.get(url);
      const hasil = result?.data;
      console.log({
        hasil,
        url,
        currentPns,
      });
      resolve(result?.data);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const updateDataUtama = (fetcher, nip, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentData = await fetcher.get(`/pns/data-utama/${nip}`);
      const currentPns = currentData?.data?.data;
      const url = `/pns/data-utama-update`;
      const payload = {
        ...data,
        pns_orang_id: currentPns?.id,
      };
      const result = await fetcher.post(url, payload);
      resolve(result?.data);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const fetcherIPASN = (fetcher, nip) => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `/pns/nilaiipasn?nip=${nip}`;
      const result = await fetcher.get(url);
      resolve(result?.data);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const refreshJabatan = async (req, res) => {
  try {
    const user = req.user;
    const siasnRequest = req.siasnRequest;
    const nip = user?.employee_number;

    const result = await fetcherSyncJabatanGolongan(
      siasnRequest,
      nip,
      "data-utama-jabatansync"
    );

    res.json({
      message: result?.Message,
      status: "success",
    });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const refreshJabatanByNip = async (req, res) => {
  try {
    const siasnRequest = req.siasnRequest;
    const nip = req?.query?.nip;

    const result = await fetcherSyncJabatanGolongan(
      siasnRequest,
      nip,
      "data-utama-jabatansync"
    );

    res.json({
      message: result?.Message,
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const refreshGolongan = async (req, res) => {
  try {
    const user = req.user;
    const siasnRequest = req.siasnRequest;
    const nip = user?.employee_number;

    const result = await fetcherSyncJabatanGolongan(
      siasnRequest,
      nip,
      "data-utama-golongansync"
    );

    res.json({
      message: result?.Message,
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};
const refreshGolonganByNip = async (req, res) => {
  try {
    const siasnRequest = req.siasnRequest;
    const nip = req?.query?.nip;

    const result = await fetcherSyncJabatanGolongan(
      siasnRequest,
      nip,
      "data-utama-golongansync"
    );

    res.json({
      message: result?.Message,
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const ipASN = async (req, res) => {
  try {
    const user = req.user;
    const siasnRequest = req.siasnRequest;
    const nip = user?.employee_number;

    const result = await fetcherIPASN(siasnRequest, nip);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const ipASNByNip = async (req, res) => {
  try {
    const siasnRequest = req.siasnRequest;
    const nip = req?.query?.nip;

    const result = await fetcherIPASN(siasnRequest, nip);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const updateDataUtamaByNip = async (req, res) => {
  try {
    const siasnRequest = req.siasnRequest;
    const nip = req?.query?.nip;
    const data = req?.body;

    const payload = {
      nip,
      data,
    };

    if (nip === "199103052019031008") {
      res.status(403).json({ message: "Forbidden" });
    } else {
      const result = await updateDataUtama(siasnRequest, nip, data);

      await createLogSIASN({
        employeeNumber: nip,
        request_data: JSON.stringify(payload),
        siasnService: "data-utama-update",
        type: "UPDATE",
        userId: req.user.customId,
      });

      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  refreshJabatan,
  refreshJabatanByNip,
  refreshGolongan,
  refreshGolonganByNip,
  ipASN,
  ipASNByNip,
  updateDataUtamaByNip,
};
