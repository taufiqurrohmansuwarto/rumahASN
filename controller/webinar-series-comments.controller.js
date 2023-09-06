const WebinarSeriesComments = require("@/models/webinar-series-comments.model");
const WebinarSeriesParticipate = require("@/models/webinar-series-participates.model");

// user
const commentUserIndex = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const result = await WebinarSeriesParticipate.query()
      .where("id", id)
      .andWhere("user_id", customId)
      .first();

    if (!result) {
      res.status(400).json({ code: 400, message: "You are not participant" });
    } else {
      const result = await WebinarSeriesComments.query()
        .where("webinar_series_id", id)
        .withGraphFetched("participant")
        .orderBy("created_at", "desc");

      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const commentUserCreate = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const result = await WebinarSeriesParticipate.query()
      .where("id", id)
      .andWhere("user_id", customId)
      .first();

    if (!result) {
      res.status(400).json({ code: 400, message: "You are not participant" });
    } else {
      await WebinarSeriesComments.query().insert({
        webinar_series_id: id,
        user_id: customId,
        comment: req.body.comment,
      });

      res.json({ code: 200, message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const commentUserUpdate = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const commentUserDelete = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

// admin
const commentAdminIndex = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await WebinarSeriesComments.query()
      .where("webinar_series_id", id)
      .withGraphFetched("participant")
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

    await WebinarSeriesComments.query().insert({
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

    await WebinarSeriesComments.query()
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

    await WebinarSeriesComments.query()
      .patch({
        comment: "komentar telah dihapus",
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

module.exports = {
  // user
  commentUserIndex,
  commentUserCreate,
  commentUserUpdate,
  commentUserDelete,

  // admin
  commentAdminIndex,
  commentAdminCreate,
  commentAdminUpdate,
  commentAdminDelete,
};
