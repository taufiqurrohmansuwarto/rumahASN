const WebinarSeries = require("@/models/webinar-series.model copy");
const WebinarSeriesParticipates = require("@/models/webinar-series-participates.model");

// admin
const listAdmin = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const result = await WebinarSeries.query().page(page - 1, limit);

    const data = {
      data: result.results,
      limit: parseInt(limit),
      page: parseInt(page),
      total: result.total,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const detailWebinarAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await WebinarSeries.query().findById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createWebinar = async (req, res) => {
  try {
    const { customId } = req.user;
    const body = req.body;

    const result = await WebinarSeries.query().insert({
      ...body,
      created_by: customId,
      updated_by: customId,
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateWebinar = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req.user;
    const body = req.body;

    const result = await WebinarSeries.query().patchAndFetchById(id, {
      ...body,
      updated_by: customId,
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteWebinar = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await WebinarSeries.query().deleteById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// user
const listUser = async (req, res) => {
  try {
    const { customId } = req.user;
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const result = await WebinarSeriesParticipates.query()
      .where("user_id", customId)
      .page(page - 1, limit);

    const data = {
      data: result.results,
      limit: parseInt(limit),
      page: parseInt(page),
      total: result.total,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const detailWebinarUser = async (req, res) => {
  try {
    const { id } = req.query;
    const { customId } = req.user;

    const result = await WebinarSeriesParticipates.query()
      .where("user_id", customId)
      .andWhere("webinar_series_id", id)
      .first();

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const registerWebinar = async (req, res) => {
  try {
    const { customId } = req.user;
    const { id } = req.query;

    const result = await WebinarSeriesParticipates.query()
      .insert({
        user_id: customId,
        webinar_series_id: id,
      })
      .onConflict(["user_id", "webinar_series_id"])
      .merge();

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const unregisterWebinar = async (req, res) => {
  try {
    const { customId } = req.user;
    const { id } = req.query;

    const result = await WebinarSeriesParticipates.query()
      .delete()
      .where("user_id", customId)
      .andWhere("webinar_series_id", id);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// document
const generateCertificate = async (req, res) => {};
const uploadTemplate = async (req, res) => {};

module.exports = {
  listAdmin,
  detailWebinarAdmin,
  createWebinar,
  updateWebinar,
  deleteWebinar,

  listUser,
  detailWebinarUser,
  registerWebinar,
  unregisterWebinar,

  generateCertificate,
  uploadTemplate,
};
