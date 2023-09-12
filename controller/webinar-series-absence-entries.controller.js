const WebinarAbsenceEntry = require("@/models/webinar-series-absence-entries.model");

const absenceEntries = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await WebinarAbsenceEntry.query().where(
      "webinar_series_id",
      id
    );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const createAbsenceEntries = async (req, res) => {
  try {
    const { id } = req?.query;

    await WebinarAbsenceEntry.query().insert({
      ...req?.body,
      webinar_series_id: id,
    });

    res.json({ code: 200, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const updateAbsenceEntries = async (req, res) => {
  try {
    const { id, absenceId } = req?.query;

    await WebinarAbsenceEntry.query()
      .patch({
        ...req?.body,
      })
      .where("id", absenceId)
      .andWhere("webinar_series_id", id);

    res.json({ code: 200, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const deleteAbsenceEntries = async (req, res) => {
  try {
    const { id, absenceId } = req?.query;

    await WebinarAbsenceEntry.query()
      .delete()
      .where("id", absenceId)
      .andWhere("webinar_series_id", id);

    res.json({ code: 200, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  absenceEntries,
  createAbsenceEntries,
  deleteAbsenceEntries,
  updateAbsenceEntries,
};
