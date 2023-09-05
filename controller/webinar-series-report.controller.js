const WebinarSeriesParticipate = require("@/models/webinar-series-participates.model");
const WebinarSeriesSurveys = require("@/models/webinar-series-surveys.model");
const WebinarSeriesSurveysQuestion = require("@/models/webinar-series-surveys-questions.model");

const xlsx = require("xlsx");
const { iteratee, times } = require("lodash");

const serializeDataReportParticipant = (data) => {
  if (!data?.length) {
    return [];
  } else {
    const result = data.map((item) => {
      return {
        Nama: item?.participant?.username,
        "NIP/NIPTTK": item?.participant?.employee_number || "-",
        Jabatan: item?.participant?.info?.jabatan?.jabatan,
        "Perangkat Daerah": item?.participant?.info?.perangkat_daerah?.detail,
        "Tanggal Registrasi": item?.created_at,
      };
    });
    return result;
  }
};

const valueToText = (value) => {
  if (value === 1) {
    return "Sangat Tidak Puas";
  } else if (value === 2) {
    return "Tidak Puas";
  } else if (value === 3) {
    return "Cukup Puas";
  } else if (value === 4) {
    return "Puas";
  } else if (value === 5) {
    return "Sangat Puas";
  }
};

const serializeWebinarSeriesSurveys = (data) => {
  if (!data?.length) {
    return [];
  } else {
    // key : 1, value: 0
    const result = data.map((x) => {
      const hasil = times(5, (i) => {
        const key = i + 1;
        const value = x[key];
        return {
          label: valueToText(key),
          key,
          value: parseInt(value),
        };
      });

      return {
        question: x?.question,
        chart: hasil,
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
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 1 then 1 else 0 end)`
        ).as("1"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 2 then 1 else 0 end)`
        ).as("2"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 3 then 1 else 0 end)`
        ).as("3"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 4 then 1 else 0 end)`
        ).as("4"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 5 then 1 else 0 end)`
        ).as("5"),
        "webinar_series_surveys.webinar_series_id"
      )
      .joinRelated("webinar_series_surveys")
      .where("webinar_series_surveys.webinar_series_id", id)
      .andWhere("webinar_series_surveys_questions.type", "scale")
      .groupBy(
        "webinar_series_surveys_questions.question",
        "webinar_series_surveys.webinar_series_id"
      );

    res.json(serializeWebinarSeriesSurveys(result));
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
