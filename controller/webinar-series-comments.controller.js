const WebinarSeriesComments = require("@/models/webinar-series-comments.model");
const WebinarSeriesParticipate = require("@/models/webinar-series-participates.model");

// user
const commentUserIndex = async (req, res) => {};
const commentUserCreate = async (req, res) => {};
const commentUserUpdate = async (req, res) => {};
const commentUserDelete = async (req, res) => {};

// admin
const commentAdminIndex = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await WebinarSeriesComments.query()
      .where("webinar_series_id", id)
      .orderBy("created_at", "desc");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const commentAdminCreate = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    await WebinarSeriesParticipate.query().insert({
      webinar_series_id: id,
      user_id: customId,
      comment: req.body.comment,
    });

    res.json({ code: 200, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const commentAdminUpdate = async (req, res) => {
  try {
    const { id, commentId } = req?.query;
    const { customId } = req?.user;

    await WebinarSeriesParticipate.query()
      .patch({
        comment: req.body.comment,
      })
      .where("id", commentId)
      .andWhere("user_id", customId)
      .andWhere("webinar_series_id", id);

    res.json({ code: 200, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const commentAdminDelete = async (req, res) => {
  try {
    const { id, commentId } = req?.query;
    const { customId } = req?.user;

    await WebinarSeriesParticipate.query()
      .delete()
      .where("id", commentId)
      .andWhere("user_id", customId)
      .andWhere("webinar_series_id", id);

    res.json({ code: 200, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  // user

  // admin
  commentAdminIndex,
  commentAdminCreate,
  commentAdminUpdate,
  commentAdminDelete,
};
