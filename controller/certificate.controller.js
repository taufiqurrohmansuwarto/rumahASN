const WebinarSeriesParticipates = require("@/models/webinar-series-participates.model");

const downloadWebinarCertificates = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await WebinarSeriesParticipates.query()
      .findById(id)
      .select("document_sign")
      .select("id");

    if (!result) {
      res.json(null);
    } else {
      res.json(result?.document_sign);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkWebinarCertificates = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await WebinarSeriesParticipates.query()
      .findById(id)
      .withGraphFetched("[webinar_series]");

    if (!result) {
      res.json(null);
    } else {
      if (
        result?.is_generate_certificate &&
        result?.user_information &&
        result?.document_sign &&
        result?.document_sign_at
      ) {
        res.json(result);
      } else {
        res.json(null);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  checkWebinarCertificates,
  downloadWebinarCertificates,
};
