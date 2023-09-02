const WebinarSurvey = require("@/models/webinar-series-surveys.model");
const WebinarParticipate = require("@/models/webinar-series-participates.model");

const makeSurvey = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    const body = req?.body;

    const data = body?.map((item) => {
      return {
        webinar_series_id: id,
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
        webinar_series_id: id,
        user_id: customId,
      });

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  makeSurvey,
};
