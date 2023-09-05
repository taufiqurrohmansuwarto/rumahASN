const WebinarSeriesParticipate = require("@/models/webinar-series-participates.model");
const WebinarSeriesSurveys = require("@/models/webinar-series-surveys.model");
const WebinarSeriesSurveysQuestion = require("@/models/webinar-series-surveys-questions.model");

const xlsx = require("xlsx");

const serializeDataReportParticipant = (data) => {
  if (!data?.length) {
    return [];
  } else {
    const result = data.map((item) => {
      return {
        Nama: item?.participant?.username,
        Jabatan: item?.participant?.info?.jabatan?.jabatan,
        "Perangkat Daerah": item?.participant?.info?.perangkat_daerah?.detail,
        "Tanggal Registrasi": item?.created_at,
      };
    });
    return result;
  }
};

const reportSurvey = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await WebinarSeriesSurveysQuestion.query()
      .select(
        "webinar_series_surveys_questions.question",
        WebinarSeriesSurveys.query().count().where("value", 1).as("1"),
        WebinarSeriesSurveys.query().count().where("value", 2).as("2"),
        WebinarSeriesSurveys.query().count().where("value", 3).as("3"),
        WebinarSeriesSurveys.query().count().where("value", 4).as("4"),
        WebinarSeriesSurveys.query().count().where("value", 5).as("5"),
        "webinar_series_surveys.webinar_series_id"
      )
      .joinRelated("webinar_series_surveys")
      .where("webinar_series_surveys.webinar_series_id", id)
      .andWhere("webinar_series_surveys_questions.type", "scale")
      .groupBy(
        "webinar_series_surveys_questions.question",
        "webinar_series_surveys.webinar_series_id"
      );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

// download participants
const downloadParticipants = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await WebinarSeriesParticipate.query()
      .where("webinar_series_id", id)
      .withGraphFetched("[participant]");

    const data = serializeDataReportParticipant(result);
    console.log(data);

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);

    xlsx.utils.book_append_sheet(wb, ws, "Peserta");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "peserta.xlsx"
    );

    res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  downloadParticipants,
  reportSurvey,
};
