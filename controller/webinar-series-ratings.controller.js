const WebinarSeriesRatings = require("@/models/webinar-series-ratings.model");
const WebinarSeriesParticipate = require("@/models/webinar-series-participates.model");
const WebinarSeries = require("@/models/webinar-series.model");
const { toNumber, round } = require("lodash");

const serializeRating = (data, totalUser) => {
  const ratings = [1, 2, 3, 4, 5];

  return ratings.map((item) => {
    const result = data?.find((x) => x?.rating === item);
    return {
      rating: item,
      total: result?.count || 0,
      percentage: (result?.count / totalUser) * 100 || 0,
    };
  });
};

const getRatingForUser = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const currentWebinarParticipate = await WebinarSeriesParticipate.query()
      .where("id", id)
      .andWhere("user_id", customId)
      .first();

    if (!currentWebinarParticipate) {
      res.status(400).json({ code: 400, message: "You are not participant" });
    } else {
      const webinarId = currentWebinarParticipate?.webinar_series_id;

      const averageRatings = await WebinarSeriesRatings.query()
        .avg("rating")
        .where("webinar_series_id", webinarId)
        .first();

      const totalUserRatings = await WebinarSeriesRatings.query()
        .count("rating")
        .where("webinar_series_id", webinarId);

      // query include count rating 5,4,3,2,1
      const totalRatingPerValue = await WebinarSeriesRatings.query()
        .select("rating")
        .count("rating")
        .where("webinar_series_id", webinarId)
        .groupBy("rating");

      const avgRating = toNumber(round(averageRatings?.avg, 2)) || 0;

      const aggregate = {
        averageRatings: avgRating,
        totalUserRatings: totalUserRatings[0]?.count || 0,
        totalRatingPerValue: serializeRating(
          totalRatingPerValue,
          totalUserRatings[0]?.count || 0
        ),
      };

      const page = req?.query?.page || 1;
      const limit = req?.query?.limit || 10;
      const rating = req?.query?.rating;

      const result = await WebinarSeriesRatings.query()
        .withGraphFetched("participant")
        .where("webinar_series_id", webinarId)
        .andWhere((builder) => {
          if (rating) {
            builder.where("rating", rating);
          }
        })
        .page(parseInt(page) - 1, parseInt(limit))
        .orderBy("created_at", "desc");

      const data = {
        data: result.results,
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
      };

      const payload = {
        aggregate,
        data,
      };

      res.json(payload);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

// id dari webinar id
const getRating = async (req, res) => {
  try {
    const { id } = req?.query;

    const averageRatings = await WebinarSeriesRatings.query()
      .avg("rating")
      .where("webinar_series_id", id)
      .first();

    const totalUserRatings = await WebinarSeriesRatings.query()
      .count("rating")
      .where("webinar_series_id", id);

    // query include count rating 5,4,3,2,1
    const totalRatingPerValue = await WebinarSeriesRatings.query()
      .select("rating")
      .count("rating")
      .where("webinar_series_id", id)
      .groupBy("rating");

    const avgRating = toNumber(round(averageRatings?.avg, 2)) || 0;

    const aggregate = {
      averageRatings: avgRating,
      totalUserRatings: totalUserRatings[0]?.count || 0,
      totalRatingPerValue: serializeRating(
        totalRatingPerValue,
        totalUserRatings[0]?.count || 0
      ),
    };

    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 10;
    const rating = req?.query?.rating;

    const result = await WebinarSeriesRatings.query()
      .withGraphFetched("participant")
      .where("webinar_series_id", id)
      .andWhere((builder) => {
        if (rating) {
          builder.where("rating", rating);
        }
      })
      .orderBy("created_at", "desc")
      .page(parseInt(page) - 1, parseInt(limit));

    const data = {
      data: result.results,
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const payload = {
      aggregate,
      data,
    };

    res.json(payload);
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
  getRatingForUser,
};
