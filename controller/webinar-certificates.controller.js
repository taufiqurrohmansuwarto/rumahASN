const WebinarParticipates = require("@/models/webinar-series-participates.model");
const WebinarSeries = require("@/models/webinar-series.model");

const daftarCertificateSigner = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const employee_number = req.user.employee_number;

    const webinar = await WebinarSeries.query()
      .where({
        employee_number_signer: employee_number,
        status: "published",
        type_sign: "PERSONAL_SIGN",
        is_allow_download_certificate: true,
      })
      .page(page - 1, limit);

    const data = {
      data: webinar?.results,
      pagination: {
        total: webinar?.total,
        page,
        limit,
      },
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const dataCertificateSignerByWebinarId = async (req, res) => {
  try {
    const webinar_id = req.query?.webinarId;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    // cek dulu webinar yang sudah berstatus published dan is_allow_download_certificate true
    const webinar = await WebinarSeries.query()
      .where({
        id: webinar_id,
        is_allow_download_certificate: true,
        status: "published",
        type_sign: "PERSONAL_SIGN",
      })
      .first();

    if (!webinar) {
      const data = {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
        },
      };
      res.json(data);
    } else {
      const webinarParticipates = await WebinarParticipates.query()
        .where({ webinar_series_id: webinar_id })
        .page(page - 1, limit);

      const data = {
        data: webinarParticipates.results,
        pagination: {
          total: webinarParticipates.total,
          page,
          limit,
        },
      };

      res.json(data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const signCertificateByWebinarId = async (req, res) => {
  try {
    const webinar_id = req?.query?.id;
    const data = req?.body;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const signCertificateById = async (req, res) => {
  try {
    const webinar_participates_id = req?.query?.id;
    const data = {};
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  daftarCertificateSigner,
  dataCertificateSignerByWebinarId,
  signCertificateById,
  signCertificateByWebinarId,
};
