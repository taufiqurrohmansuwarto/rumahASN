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
    const {
      siasnRequest,
      user,
      query: { nip },
      body: data,
    } = req;

    if (!nip) {
      return res.status(400).json({ message: "NIP is required" });
    }

    const payload = { nip, data };

    if (data?.type === "KPKN") {
      await handleKPKNUpdate(siasnRequest, nip, data);
    } else {
      if (nip === "199103052019031008") {
        await logSIASNUpdate(nip, payload, user.customId);
        return res.status(400).json({ message: "Data tidak bisa diupdate" });
      }
      await updateDataUtama(siasnRequest, nip, data);
    }

    await logSIASNUpdate(nip, payload, user.customId);
    return res.json({ message: "Data berhasil diupdate" });
  } catch (error) {
    console.error("Error in updateDataUtamaByNip:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const handleKPKNUpdate = async (siasnRequest, nip, data) => {
  const kpknData = { kpkn_id: "8ae4828939f5c253013a01d1586253f7" };
  await updateDataUtama(siasnRequest, nip, kpknData);
  await updateDataUtama(siasnRequest, nip, data);
};

const logSIASNUpdate = async (nip, payload, userId) => {
  await createLogSIASN({
    employeeNumber: nip,
    request_data: JSON.stringify(payload),
    siasnService: "data-utama-update",
    type: "UPDATE",
    userId,
  });
};

module.exports = {
  ipASN,
  ipASNByNip,
  updateDataUtamaByNip,
};
