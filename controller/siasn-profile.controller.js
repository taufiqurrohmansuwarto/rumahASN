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
const { getCVProxyByPnsId } = require("@/utils/siasn-local-proxy.utils");

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
    const { nip } = req?.query;

    // Fallback jika NIP kosong
    if (!nip) {
      return res.json({ data: null });
    }

    const { siasnRequest: fetcher } = req;

    // Query dengan select minimal
    const hasil = await SiasnEmployees.query()
      .where("nip_baru", nip)
      .first()
      .select("pns_id");

    // Fallback jika PNS tidak ditemukan
    if (!hasil?.pns_id) {
      return res.json({ data: null });
    }

    const result = await foto(fetcher, hasil.pns_id);

    // Fallback jika foto tidak ada
    if (!result?.data) {
      return res.json({ data: null });
    }

    // Convert ke base64
    const photos = `data:image/png;base64,${Buffer.from(
      result.data,
      "binary"
    ).toString("base64")}`;

    res.json({ data: photos });
  } catch (error) {
    // Fallback jika terjadi error apapun
    res.json({ data: null });
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

module.exports.getCVProxyByNip = async (req, res) => {
  try {
    const { token, query } = req;
    const { nip, format } = query; // format: 'pdf' atau 'base64' (default)

    // Fallback jika NIP kosong
    if (!nip) {
      return res.json({ data: null });
    }

    const currentPnsId = await SiasnEmployees.query()
      .where("nip_baru", nip)
      .first()
      .select("pns_id");

    // Fallback jika PNS tidak ditemukan
    if (!currentPnsId?.pns_id) {
      return res.json({ data: null });
    }

    const result = await getCVProxyByPnsId(token, currentPnsId.pns_id);

    // Fallback jika hasil kosong
    if (!result) {
      return res.json({ data: null });
    }

    // Convert ArrayBuffer to Buffer
    const pdfBuffer = Buffer.from(result);

    // Jika format PDF (untuk download langsung)
    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="CV_${nip}.pdf"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);
      return res.send(pdfBuffer);
    }

    // Default: return sebagai base64 JSON (untuk preview)
    const base64 = pdfBuffer.toString("base64");
    res.json({
      data: `data:application/pdf;base64,${base64}`,
      filename: `CV_${nip}.pdf`,
    });
  } catch (error) {
    handleError(res, error);
  }
};
