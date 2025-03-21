const {
  foto,
  anak,
  orangTua,
  pasangan,
  dataUtama,
} = require("@/utils/siasn-utils");
const SiasnEmployees = require("@/models/siasn-employees.model");

module.exports.fotoPns = async (req, res) => {
  try {
    const { siasnRequest: fetcher } = req;
    const { employee_number: nip } = req?.user;
    // const hasil = await dataUtama(fetcher, nip);
    const hasil = await SiasnEmployees.query()
      .where("nip_baru", nip)
      .first()
      .select("pns_id");

    const result = await foto(fetcher, hasil?.pns_id);
    const data = result?.data;

    // blob to base64
    const base64 = Buffer.from(data, "binary").toString("base64");
    const photos = `data:image/png;base64,${base64}`;
    const payload = {
      data: photos,
    };

    res.json(payload);
    // custom headers for image png
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports.fotoByNip = async (req, res) => {
  try {
    const { siasnRequest: fetcher } = req;
    const { nip } = req?.query;
    const hasil = await SiasnEmployees.query()
      .where("nip_baru", nip)
      .first()
      .select("pns_id");

    const result = await foto(fetcher, hasil?.pns_id);
    const data = result?.data;

    // blob to base64
    const base64 = Buffer.from(data, "binary").toString("base64");
    const photos = `data:image/png;base64,${base64}`;
    const payload = {
      data: photos,
    };

    res.json(payload);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports.dataAnak = async (req, res) => {
  try {
    const { siasnRequest: fetcher } = req;
    const { employee_number: nip } = req?.user;
    const result = await anak(fetcher, nip);
    console.log(result);
    const data = result?.data;
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports.dataOrangTua = async (req, res) => {
  try {
    const { siasnRequest: fetcher } = req;
    const { employee_number: nip } = req?.user;
    const result = await orangTua(fetcher, nip);
    const hasil = result?.data?.data;

    res.json("test");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports.dataPasangan = async (req, res) => {
  try {
    const { siasnRequest: fetcher } = req;
    const { employee_number: nip } = req?.user;
    const result = await pasangan(fetcher, nip);

    const data = result?.data?.data;

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
