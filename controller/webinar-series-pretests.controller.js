const WebinarSeriesPretests = require("@/models/webinar-series-pretests.model");

const findPretest = async (req, res) => {
  try {
    const { id } = req.query;
    const data = await WebinarSeriesPretests.query().where(
      "webinar_series_id",
      id
    );

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getPretest = async (req, res) => {
  try {
    const { id, pretestId } = req.query;
    const data = await WebinarSeriesPretests.query()
      .where({
        id: pretestId,
        webinar_series_id: id,
      })
      .first();
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const createPretest = async (req, res) => {
  try {
    const { customId } = req.user;
    const { id } = req.query;
    const { body } = req;
    await WebinarSeriesPretests.query().insert({
      ...body,
      webinar_series_id: id,
      user_id: customId,
    });
    res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const updatePretest = async (req, res) => {
  try {
    const { id } = req.query;
    const { body } = req;

    await WebinarSeriesPretests.query()
      .where({
        id: body.id,
        webinar_series_id: id,
      })
      .update(body);

    res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const removePretest = async (req, res) => {
  try {
    const { id, pretestId } = req.query;
    await WebinarSeriesPretests.query().delete().where({
      id: pretestId,
      webinar_series_id: id,
    });

    res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  findPretest,
  getPretest,
  createPretest,
  updatePretest,
  removePretest,
};
