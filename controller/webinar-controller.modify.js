const WebinarSeries = require("@/models/webinar-series.model");
const WebinarSeriesParticipates = require("@/models/webinar-series-participates.model");

const aggregateCertificates = async (req, res) => {
  try {
    const { id } = req.query;

    const totalUserGenerateCertificate = await WebinarSeriesParticipates.query()
      .where("webinar_series_id", id)
      .andWhere("is_generate_certificate", true)
      .count("id");

    const totalUserNotGenerateCertificate =
      await WebinarSeriesParticipates.query()
        .where("webinar_series_id", id)
        .andWhere("is_generate_certificate", false)
        .count("id");

    const totalUser = await WebinarSeriesParticipates.query()
      .where("webinar_series_id", id)
      .count("id");

    const data = {
      totalUserGenerateCertificate: totalUserGenerateCertificate[0].count,
      totalUserNotGenerateCertificate: totalUserNotGenerateCertificate[0].count,
      totalUser: totalUser[0].count,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  aggregateCertificates,
};
