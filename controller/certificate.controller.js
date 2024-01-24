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
      .select("id");

    if (!result) {
      res.json(null);
    } else {
      const data = await WebinarSeriesParticipates.query()
        .findById(id)
        .select(
          "id",
          "webinar_series_id",
          "user_id",
          "already_poll",
          "is_registered",
          "created_at",
          "updated_at",
          "is_generate_certificate"
        )
        .withGraphFetched(
          "[webinar_series(selectName), participant(simpleSelect)]"
        );

      res.json(data);
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
