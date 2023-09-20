const WebinarSeriesParticipate = require("@/models/webinar-series-participates.model");
const WebinarSeriesSurveys = require("@/models/webinar-series-surveys.model");
const WebinarSeriesSurveysQuestion = require("@/models/webinar-series-surveys-questions.model");

const xlsx = require("xlsx");
const { times, get } = require("lodash");

const getNama = (user) => {
  if (user?.group === "GOOGLE") {
    return user?.info?.username;
  } else {
    return user?.username;
  }
};

const getEmployeeNumber = (user) => {
  if (user?.group === "GOOGLE") {
    const nama_lengkap = `${user?.info?.gelar_depan} ${user?.info?.username} ${user?.info?.gelar_belakang}`;
    return nama_lengkap;
  } else {
    return user?.employee_number;
  }
};

const getEmail = (user) => {
  if (user?.group === "GOOGLE") {
    return user?.email;
  } else {
    return user?.email;
  }
};

const serializeDataReportParticipant = (data) => {
  if (!data?.length) {
    return [];
  } else {
    const result = data.map((item) => {
      return {
        Nama: getNama(item?.participant),
        email: getEmail(item?.participant),
        "NIP/NIPTTK": getEmployeeNumber(item?.participant),
        Jabatan: item?.participant?.info?.jabatan?.jabatan,
        "Perangkat Daerah": item?.participant?.info?.perangkat_daerah?.detail,
        "Tanggal Registrasi": item?.created_at,
        "Sudah Polling": item?.already_poll ? "Sudah" : "Belum",
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

    const data = serializeWebinarSeriesSurveys(result);

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const downloadSurvey = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await WebinarSeriesSurveysQuestion.query()
      .select(
        "webinar_series_surveys_questions.question",
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 1 then 1 else 0 end)`
        ).as("Sangat Tidak Puas"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 2 then 1 else 0 end)`
        ).as("Tidak Puas"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 3 then 1 else 0 end)`
        ).as("Cukup Puas"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 4 then 1 else 0 end)`
        ).as("Puas"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 5 then 1 else 0 end)`
        ).as("Sangat Puas"),
        "webinar_series_surveys.webinar_series_id"
      )
      .joinRelated("webinar_series_surveys")
      .where("webinar_series_surveys.webinar_series_id", id)
      .andWhere("webinar_series_surveys_questions.type", "scale")
      .groupBy(
        "webinar_series_surveys_questions.question",
        "webinar_series_surveys.webinar_series_id"
      );

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(result);

    xlsx.utils.book_append_sheet(wb, ws, "Survey");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "survey.xlsx"
    );

    res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
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
  downloadSurvey,
  reportSurvey,
};
