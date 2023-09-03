const WebinarSurvey = require("@/models/webinar-series-surveys.model");
const WebinarQuestionSurvey = require("@/models/webinar-series-surveys-questions.model");
const WebinarParticipate = require("@/models/webinar-series-participates.model");

const getSurvey = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const currentWebinarSeries = await WebinarParticipate.query()
      .where("id", id)
      .andWhere("user_id", customId)
      .first()
      .withGraphFetched("[webinar_series]");

    if (!currentWebinarSeries?.already_poll || !currentWebinarSeries) {
      const result = await WebinarQuestionSurvey.query();
      res.json(result);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const makeSurvey = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    const body = req?.body;

    const currentWebinarSeries = await WebinarParticipate.query()
      .where("id", id)
      .andWhere("user_id", customId)
      .first();

    // check already poll
    if (currentWebinarSeries?.already_poll) {
      res.status(200).json({ message: "Already poll" });
    } else {
      const data = body?.map((item) => {
        return {
          webinar_series_id: currentWebinarSeries?.webinar_series_id,
          webinar_series_surveys_question_id: item?.id,
          user_id: customId,
          value: item?.value,
          comment: item?.comment,
        };
      });

      await WebinarSurvey.query().insertGraph(data);
      await WebinarParticipate.query()
        .patch({
          already_poll: true,
        })
        .where({
          id,
          user_id: customId,
        });

      res.status(200).json({ message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  makeSurvey,
  getSurvey,
};
