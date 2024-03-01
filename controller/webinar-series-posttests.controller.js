const WebinarSeriesPosttests = require("@/models/webinar-series-postests.model");

const index = async (req, res) => {
  try {
    const { webinarId } = req?.query;
    const result = await WebinarSeriesPosttests.query().where(
      "webinar_series_id",
      webinarId
    );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const show = async (req, res) => {
  try {
    const { posttestId } = req?.query;
    const result = await WebinarSeriesPosttests.query().findById(posttestId);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const store = async (req, res) => {
  try {
    const { body } = req;

    const result = await WebinarSeriesPosttests.query().insert(body);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { webinarId, posttestId } = req?.query;
    const { body } = req;

    const result = await WebinarSeriesPosttests.query()
      .where({
        id: posttestId,
        webinar_series_id: webinarId,
      })
      .patch(body);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const destroy = async (req, res) => {
  try {
    const { webinarId, posttestId } = req?.query;
    const result = await WebinarSeriesPosttests.query().delete().where({
      id: posttestId,
      webinar_series_id: webinarId,
    });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
};
