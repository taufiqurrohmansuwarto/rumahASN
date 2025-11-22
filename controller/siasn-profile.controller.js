const {
  foto,
  anak,
  orangTua,
  pasangan,
  dataUtama,
  updateFotoSiasn,
} = require("@/utils/siasn-utils");
const SiasnEmployees = require("@/models/siasn-employees.model");
const { handleError } = require("@/utils/helper/controller-helper");
const { default: axios } = require("axios");

const URL_REMOVE_BG = "http://localhost:5000/remove-bg";

const removeBackground = async (imageBase64) => {
  const response = await axios.post(URL_REMOVE_BG, {
    image_base64: imageBase64,
  });
  return response.data;
};

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

module.exports.updateFotoPns = async (req, res) => {
  // local

  try {
    const { siasnRequest: siasnFetcher, fetcher: masterFetcher } = req;
    const { employee_number: nip } = req?.user;

    const currentPnsId = await SiasnEmployees.query()
      .where("nip_baru", nip)
      .first()
      .select("pns_id");

    if (!currentPnsId) {
      res.status(404).json({
        message: "PNS not found",
      });
    } else {
      const result = await masterFetcher.get(
        `/master-ws/operator/employees/${nip}/data-utama-master`
      );

      const foto = result?.data?.foto;

      if (!foto || foto?.includes("foto_kosong")) {
        res.status(400).json({
          message: "Foto tidak ditemukan atau tidak valid",
        });
      } else {
        await updateFotoSiasn(siasnFetcher, {
          pnsId: currentPnsId?.pns_id,
          foto,
        });

        res.json({ message: "success" });
      }
    }
  } catch (error) {
    handleError(res, error);
  }
};

module.exports.updateFotoSiasnByNip = async (req, res) => {
  try {
    const { siasnRequest: siasnFetcher, fetcher: masterFetcher } = req;
    const { nip } = req?.query;

    const currentPnsId = await SiasnEmployees.query()
      .where("nip_baru", nip)
      .first()
      .select("pns_id");

    if (!currentPnsId) {
      res.status(404).json({
        message: "PNS not found",
      });
    } else {
      const result = await masterFetcher.get(
        `/master-ws/operator/employees/${nip}/data-utama-master`
      );

      const foto = result?.data?.foto;

      if (!foto || foto?.includes("foto_kosong")) {
        res.status(400).json({
          message: "Foto tidak ditemukan atau tidak valid",
        });
      } else {
        const payload = {
          pnsId: currentPnsId?.pns_id,
          foto,
        };
        await updateFotoSiasn(siasnFetcher, payload);

        res.json({ message: "success" });
      }
    }
  } catch (error) {
    handleError(res, error);
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
