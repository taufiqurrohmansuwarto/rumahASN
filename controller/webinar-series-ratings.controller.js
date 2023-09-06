const WebinarSeriesRatings = require("@/models/webinar-series-ratings.model");
const WebinarSeriesParticipate = require("@/models/webinar-series-participates.model");
const WebinarSeries = require("@/models/webinar-series.model");

// id dari webinar id
const getRating = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await WebinarSeriesRatings.query()
      .withGraphFetched("participant")
      .where("webinar_series_id", id)
      .orderBy("created_at", "desc");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

// create rating dicari berdasarkan id di webinar participates jadi bukan id untuk webinar_id
const createRating = async (req, res) => {
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
      const { rating, comment } = req?.body;
      await WebinarSeriesRatings.query()
        .insert({
          webinar_series_id: result?.webinar_series_id,
          user_id: customId,
          rating,
          comments: comment,
        })
        .onConflict(["webinar_series_id", "user_id"])
        .merge({
          rating: rating,
        });

      res.json({ code: 200, message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  createRating,
  getRating,
};
