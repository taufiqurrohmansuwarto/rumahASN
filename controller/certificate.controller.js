const WebinarSeries = require("@/models/webinar-series.model");
const WebinarSeriesParticipates = require("@/models/webinar-series-participates.model");

const checkWebinarCertificates = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await WebinarSeriesParticipates.query().findById(id);

    if (!result) {
      res.json(null);
    } else {
      const data = await WebinarSeriesParticipates.query()
        .findById(id)
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
};
